package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	ApiUrl      string
	PromotionId string
	ProductId   string
}

type CommitmentDto struct {
	Type string `json:"type"`
	Id   string `json:"id"`
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

type IssueDto struct {
	Id         string        `json:"id"`
	ProjectId  string        `json:"projectId"`
	Key        string        `json:"key"`
	Type       string        `json:"type"`
	Title      string        `json:"title"`
	Commitment CommitmentDto `json:"commitment"`
	Status     string        `json:"status"`
	State      string        `json:"state"`
	CreatedAt  string        `json:"createdAt"`
	UpdatedAt  string        `json:"updatedAt"`
}

type PaginationMetaDto struct {
	Page         int `json:"page"`
	PerPage      int `json:"perPage"`
	TotalRecords int `json:"totalRecords"`
	TotalPages   int `json:"totalPages"`
}

type PaginationResultDto struct {
	Meta PaginationMetaDto `json:"meta"`
	Data []IssueDto        `json:"data"`
}

type UpdateStatusPayload struct {
	Status string `json:"status"`
}

type CommitPayload struct {
	Commitment CommitmentDto `json:"commitment"`
}

func main() {
	config := loadConfig()
	// listIssueIds(config)
	// listSprintIssueIds(config)

	// updateIssuesStatuses(config)
	commitIssues(config)
	// decommitIssues(config)
}

func loadConfig() AppConfig {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	return AppConfig{
		ApiUrl:      os.Getenv("API_URL"),
		PromotionId: os.Getenv("PROMOTION_ID"),
		ProductId:   os.Getenv("PRODUCT_ID"),
	}
}

func listIssueIds(config AppConfig) {
	issues := listIssues(config)

	for i := 0; i < len(issues.Data); i++ {
		fmt.Println(issues.Data[i].Id)
	}
}

func listSprintIssueIds(config AppConfig) {
	sprintId := "670352caac2ceab3466bc54e"
	issues := listSprintIssues(config, sprintId)

	for i := 0; i < len(issues); i++ {
		fmt.Println(issues[i].Id)
	}
}

func updateIssuesStatuses(config AppConfig) {
	issues := []string{
		"66ebe2d9ce87451fc39f8a56",
		"66ebe2d9ce87451fc39f8a54",
	}

	newStatus := "664df81932994babda8dc70c"

	for i := 0; i < len(issues); i++ {
		id := issues[i]
		updateIssueStatus(config, id, newStatus)
	}
}

func commitIssues(config AppConfig) {
	issues := []string{
		"670354f4ac2ceab3466bf14b",
		"670354dfac2ceab3466be023",
		"670354dfac2ceab3466be069",
		"670354dfac2ceab3466be04b",
		"670354deac2ceab3466be005",
		"670354dfac2ceab3466be04f",
		"670354dfac2ceab3466be01a",
		"670354deac2ceab3466be000",
		"670354dfac2ceab3466be017",
		"670354deac2ceab3466bdff8",
		"670354dfac2ceab3466be038",
		"670354deac2ceab3466bdff3",
		"670354deac2ceab3466bdfed",
		"670354deac2ceab3466bdfe7",
		"670354dfac2ceab3466be01f",
		"670354dfac2ceab3466be021",
		"670354deac2ceab3466bdfe1",
		"670354dfac2ceab3466be014",
		"670354dfac2ceab3466be00e",
		"670354dfac2ceab3466be00a",
		"670354deac2ceab3466be002",
		"670354deac2ceab3466bdff5",
		"670354deac2ceab3466bdfda",
		"670354deac2ceab3466bdfd8",
		"670354deac2ceab3466bdfc5",
		"670354deac2ceab3466bdfc1",
		"670354deac2ceab3466bdfaf",
		"670354deac2ceab3466bdfa9",
		"670354deac2ceab3466bdfa1",
		"670354deac2ceab3466bdf96",
		"670354deac2ceab3466bdf91",
		"670354deac2ceab3466bdf86",
		"670354deac2ceab3466bdf82",
		"670354deac2ceab3466bdf77",
		"670354deac2ceab3466bdf71",
		"670354deac2ceab3466bdf69",
		"670354deac2ceab3466bdf5e",
		"670354deac2ceab3466bdf56",
		"670354deac2ceab3466bdf4c",
		"670354deac2ceab3466bdf43",
		"670354deac2ceab3466bdf3d",
		"670354deac2ceab3466bdf2f",
		"670354deac2ceab3466bdf1c",
		"670354ddac2ceab3466bdef1",
		"670354deac2ceab3466bdf23",
		"670354deac2ceab3466bdf13",
		"670354deac2ceab3466bdf10",
		"670354ddac2ceab3466bdf05",
		"670354ddac2ceab3466bdefa",
		"670354ddac2ceab3466bdef6",
	}

	sprintId := "670352caac2ceab3466bc54e"

	for i := 0; i < len(issues); i++ {
		id := issues[i]
		commitIssue(config, sprintId, id)
	}
}

func decommitIssues(config AppConfig) {
	issues := []string{
		"66ebe1ffce87451fc39f7473",
		"66ebe2d9ce87451fc39f8a54",
		"66ebe2d9ce87451fc39f89f3",
		"66ebe2d8ce87451fc39f89a1",
		"66793459836434de7b6a71ef",
		"66793c56221c08d45f77cdff",
		"66ebe2d7ce87451fc39f88cd",
		"66ebe2d7ce87451fc39f88b2",
		"66ebe2d7ce87451fc39f8908",
		"66ebe2d7ce87451fc39f88e9",
		"66ebe2d7ce87451fc39f88e7",
		"66ebe2d8ce87451fc39f892d",
		"66ebe2d7ce87451fc39f8903",
		"66ebe2d8ce87451fc39f895e",
		"66ebe2d8ce87451fc39f8965",
		"66ebe2d8ce87451fc39f892f",
		"66ebe2d8ce87451fc39f899a",
		"66ebe2d8ce87451fc39f89a3",
		"66ebe2d9ce87451fc39f89cf",
		"66ebe2d9ce87451fc39f89f5",
		"66ebe2d9ce87451fc39f89fb",
		"66ebe2d9ce87451fc39f89f7",
		"66ebe2d9ce87451fc39f89fd",
		"66ebe1ffce87451fc39f741a",
		"66793c56221c08d45f77cddd",
		"66793459836434de7b6a7223",
		"66793c58221c08d45f77cf15",
		"66793c58221c08d45f77cf8f",
		"66793c58221c08d45f77cf8b",
		"66793c56221c08d45f77cde6",
		"66ebe200ce87451fc39f74c9",
		"66793c58221c08d45f77cf33",
		"66793c58221c08d45f77cf81",
		"66ebe1ffce87451fc39f7429",
		"66ebe1ffce87451fc39f743a",
		"66ebe1ffce87451fc39f744f",
		"66ebe1ffce87451fc39f7446",
		"66ebe1ffce87451fc39f7434",
		"66ebe2d8ce87451fc39f899e",
		"66ebe2d7ce87451fc39f890a",
		"66ebe2d8ce87451fc39f8952",
		"66ebe2d8ce87451fc39f8931",
		"66ebe2d8ce87451fc39f892b",
		"66ebe2d7ce87451fc39f890c",
		"66ebe2d7ce87451fc39f88b9",
		"66ebe2d7ce87451fc39f88db",
		"66ebe2d7ce87451fc39f88d8",
		"66ebe2d7ce87451fc39f8896",
		"66ebe2d7ce87451fc39f8873",
		"66ebe2d7ce87451fc39f888c",
		"66ebe2d6ce87451fc39f8802",
		"66ebe200ce87451fc39f7543",
		"66ebe200ce87451fc39f7539",
		"66ebe200ce87451fc39f7533",
		"66ebe200ce87451fc39f74ab",
		"66ebe200ce87451fc39f748b",
		"66ebe200ce87451fc39f74b2",
		"66ebe200ce87451fc39f7488",
		"66ebe200ce87451fc39f749a",
		"66ebe200ce87451fc39f7481",
		"66ebe1ffce87451fc39f7478",
		"670354f4ac2ceab3466bf14b",
		"66ebe2d9ce87451fc39f8a56",
		"66ebe2d8ce87451fc39f895b",
		"66ebe2d9ce87451fc39f89d3",
		"66793c58221c08d45f77cf40",
		"66793c56221c08d45f77cdac",
		"66793459836434de7b6a720e",
	}

	sprintId := "670352caac2ceab3466bc54e"

	for i := 0; i < len(issues); i++ {
		id := issues[i]
		decommitIssue(config, sprintId, id)
	}
}

func listIssues(config AppConfig) PaginationResultDto {
	endpoint, err := url.Parse(config.apiUrl + "/projects/" + config.projectId + "/issues")
	if err != nil {
		panic(err)
	}

	// Add extra parameter
	params := url.Values{}
	// params.Add("status", "664df81932994babda8dc70b")
	// params.Add("commitment", "sprint:670352caac2ceab3466bc54e")
	params.Add("isCommitted", "0")
	params.Add("perPage", "50")
	params.Add("include", "meta")

	endpoint.RawQuery = params.Encode()

	req, err := http.NewRequest("GET", endpoint.String(), nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	var listing PaginationResultDto
	err = json.NewDecoder(resp.Body).Decode(&listing)
	if err != nil {
		panic(err)
	}

	return listing
}

func listSprintIssues(config AppConfig, sprintId string) []IssueDto {
	endpoint, err := url.Parse(config.apiUrl + "/projects/" + config.projectId + "/sprints/" + sprintId + "/items")
	if err != nil {
		panic(err)
	}

	// Add extra parameter
	params := url.Values{}
	params.Add("perPage", "50")
	params.Add("include", "meta")

	endpoint.RawQuery = params.Encode()

	req, err := http.NewRequest("GET", endpoint.String(), nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	var issues []IssueDto
	err = json.NewDecoder(resp.Body).Decode(&issues)
	if err != nil {
		panic(err)
	}

	return issues
}

func updateIssueStatus(config AppConfig, id string, status string) {
	endpoint := config.apiUrl + "/projects/" + config.projectId + "/issues/" + id

	data := map[string]string{
		"status": status,
	}
	payload, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(payload))

	req, err := http.NewRequest("PATCH", endpoint, bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	fmt.Println("Status:", resp.Status)
}

func commitIssue(config AppConfig, sprintId string, id string) {
	endpoint := config.apiUrl + "/projects/" + config.projectId + "/sprints/" + sprintId + "/items"

	data := map[string]string{
		"backlogItem": id,
	}
	payload, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(payload))

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	fmt.Println("Status:", resp.Status)
}

func decommitIssue(config AppConfig, sprintId string, id string) {
	endpoint := config.apiUrl + "/projects/" + config.projectId + "/sprints/" + sprintId + "/items/" + id + "/decommit"

	req, err := http.NewRequest("POST", endpoint, nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	fmt.Println("Status:", resp.Status)
}
