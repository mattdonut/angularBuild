package main

import (
	"log"
	"net/http"
)

// This is the main serving entry point

func main() {
	// Simple static webserver:
	log.Fatal(http.ListenAndServe(":8080", http.FileServer(http.Dir("./build"))))
}
