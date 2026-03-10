flowchart TD
    A[📷 Receipt Image\nJPEG / PNG] --> B

    subgraph NB1["Notebook 1 — Image Preprocessing"]
        B[Load Image\nOpenCV] --> C[Greyscale Conversion]
        C --> D[Deskew / Rotate]
        D --> E[Adaptive Threshold\nBinarisation]
        E --> F[Cleaned Image]
    end

    subgraph NB2["Notebook 2 — OCR"]
        F --> G[Tesseract OCR\npytesseract]
        G --> H[Raw Text String\nmessy, unstructured]
    end

    subgraph NB3["Notebook 3 — LLM Parsing"]
        H --> I[Prompt Template\nJinja2 / f-string]
        I --> J[OpenAI GPT-4o-mini\nAPI Call]
        J --> K[Raw JSON Response]
        K --> L{Schema\nValidation\nPydantic}
        L -->|Pass| M[Structured Receipt\nmerchant, date, items, total]
        L -->|Fail| N[🚩 Flagged for\nManual Review]
    end

    subgraph NB4["Notebook 4 — Classification"]
        M --> O[Extract Line Items]
        O --> P[Preprocess Names\nspaCy / regex]
        P --> Q[Random Forest\nClassifier]
        Q --> R{Confidence\n≥ 0.65?}
        R -->|Yes| S[Category Label\n+ confidence score]
        R -->|No| T[Semantic Fallback\nsentence-transformers]
        T --> U{Similarity\n≥ 0.45?}
        U -->|Yes| S
        U -->|No| N
    end

    subgraph NB5["Notebook 5 — Storage & Analytics"]
        S --> V[SQLite Database]
        V --> W[Spending Aggregations\npandas]
        W --> X[Daily / Weekly /\nMonthly Summaries]
        X --> Y[OpenAI GPT-4o-mini\nAdvisory Layer]
        Y --> Z[💬 Budget Advice\nNatural Language Output]
    end

    subgraph FUTURE["Future — Vision Path"]
        A2[📷 Receipt Image] --> J2[OpenAI Vision\nGPT-4o / 4o-mini]
        J2 --> L
    end

    style NB1 fill:#e8f4fd,stroke:#2196F3
    style NB2 fill:#fff3e0,stroke:#FF9800
    style NB3 fill:#f3e5f5,stroke:#9C27B0
    style NB4 fill:#e8f5e9,stroke:#4CAF50
    style NB5 fill:#fce4ec,stroke:#E91E63
    style FUTURE fill:#f5f5f5,stroke:#9E9E9E,stroke-dasharray: 5 5
    style N fill:#ffcdd2,stroke:#f44336