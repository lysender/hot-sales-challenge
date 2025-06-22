package main

import (
	"bytes"
	"encoding/json"
	"fmt"
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

	_, ok := c.Statuses[status]
	if !ok {
		c.Statuses[status] = 1
	} else {
		c.Statuses[status] += 1
	}
}

func placeOrdersSimple(config *AppConfig) {
	start := time.Now()

	result := CrawlResults{
		Statuses: map[int]int{},
	}

	var wg sync.WaitGroup

	for i := range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			status := placeOrderSimple(config, i+10000)
			result.Add(status)
		}()
	}

	wg.Wait()

	elapsed := time.Since(start)
	printElapsed(elapsed)

	for k, v := range result.Statuses {
		fmt.Printf("Status: %d, count: %d", k, v)
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

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

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
