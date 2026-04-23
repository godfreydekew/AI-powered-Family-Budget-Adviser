# AI-powered Family Budget Adviser

## Overview

![Overview Design](/budgetadvisor-ai/frontend/public/budgetadvisor.ai.svg)

Pipeline: Receipt Image Collection → Image Processing → OCR → LLM Parser → ML Classification (with Linked Data).

## How to Run the Notebook

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Jupyter**
   ```bash
   jupyter notebook
   ```

3. **Open** `image.processing.ipynb` and run all cells (Cell → Run All).

4. **Optional:** Set `IMAGE_PATH` in the first cell to your receipt image (default: `Data/tesco_receipt.png`).

## Objectives

Preprocessing → OCR (can you read the receipt text at all?)  
LLM parsing (does the JSON come back clean and validate?)  