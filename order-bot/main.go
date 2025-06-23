package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

type AppConfig struct {
	ApiUrl       string
	PromotionId  string
	ProductId    string
	JwtSecretKey string
}

type SubmitOrderDto struct {
	PromotionId string `json:"promotionId"`
	ProductId   string `json:"productId"`
}

type OrderDto struct {
	Id          string `json:"id"`
	CustomerId  string `json:"customerId"`
	PromotionId string `json:"promotionId"`
	ProductId   string `json:"productId"`
	Status      string `json:"status"`
	CreatedAt   int64  `json:"createdAt"`
	UpdatedAt   int64  `json:"updatedAt"`
}

type PaginationMetaDto struct {
	Page         int `json:"page"`
	PerPage      int `json:"perPage"`
	TotalRecords int `json:"totalRecords"`
	TotalPages   int `json:"totalPages"`
}

func main() {
	config := loadConfig()
	placeOrdersSimple(&config)
}

func loadConfig() AppConfig {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	return AppConfig{
		ApiUrl:       os.Getenv("API_URL"),
		PromotionId:  os.Getenv("PROMOTION_ID"),
		ProductId:    os.Getenv("PRODUCT_ID"),
		JwtSecretKey: os.Getenv("JWT_SECRET_KEY"),
	}
}

type CrawlResults struct {
	mu       sync.Mutex
	Statuses map[int]int
}

func (c *CrawlResults) Add(status int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	val, ok := c.Statuses[status]
	if !ok {
		c.Statuses[status] = 1
	} else {
		c.Statuses[status] = val + 1
	}
}

type Workload struct {
	Id    int
	Chaos bool
}

func randomInt(min int, max int) int {
	return min + rand.Intn(max-min)
}

func worker(id int, config *AppConfig, jobs <-chan int, results chan<- int) {
	fmt.Println("Worker", id)

	for customerId := range jobs {
		status := placeOrderSimple(config, customerId)
		results <- status
	}
}

func placeOrdersSimple(config *AppConfig) {
	start := time.Now()

	stats := CrawlResults{
		Statuses: map[int]int{},
	}

	const numWorkers = 10
	const numJobs = 1000

	jobs := make(chan int, numJobs*2)
	results := make(chan int, numJobs*2)

	for w := 1; w <= numWorkers; w++ {
		go worker(w, config, jobs, results)
	}

	for j := 1; j <= numJobs; j++ {
		// Regular job
		customerId := j + 10000
		jobs <- customerId
		// Also send chaos
		randCustomerId := randomInt(10000, 10000+numJobs)
		jobs <- randCustomerId
	}

	close(jobs)

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	counter := 0
	for a := 1; a <= numJobs*2; a++ {
		status := <-results
		stats.Add(status)

		if counter%100 == 0 {
			slog.Info("Processed a batch")
		}

		counter += 1
	}

	elapsed := time.Since(start)
	printElapsed(elapsed)

	for k, v := range stats.Statuses {
		fmt.Printf("Status: %d, count: %d\n", k, v)
	}
}

func printElapsed(elapsed time.Duration) {
	if elapsed >= 2*time.Second {
		fmt.Printf("Duration: %s\n", elapsed.Round(time.Millisecond).String())
	} else {
		fmt.Printf("Duration: %d ms\n", elapsed.Milliseconds())
	}
}

func placeOrderSimple(config *AppConfig, customerId int) int {
	token := generateToken(config, customerId)

	endpoint := config.ApiUrl + "/orders/placeOrderSimple"

	data := map[string]string{
		"promotionId": config.PromotionId,
		"productId":   config.ProductId,
	}
	payload, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	return resp.StatusCode
}

func generateToken(config *AppConfig, customerId int) string {
	claims := jwt.MapClaims{
		"sub": strconv.Itoa(customerId),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := []byte(config.JwtSecretKey)
	signed, err := token.SignedString(secret)
	if err != nil {
		panic(err)
	}

	return signed
}
