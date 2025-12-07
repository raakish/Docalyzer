# Docalyzer
Docalyzer is a web application where a person can upload a contract document that they have. Docalyzer will then analyze the contract, providing users with risk levels, ambiguities, summaries, and more for each clause. I will explain the **features of this program**, the **impact it makes**, and **how to set it up**.

---

## Features
Docalyzer is an app where a user can evaluate the risks of a contract without having to manually read it themselves. Here are the features: 
1. A convenient file upload system for uploading the contract
2. A viewer explaining the text that was found
3. Gemini API(2.5 Flash) analyzes the document
   - Provides the the clause number, clause title, risk score(on a scale of 1 to 10), issues identified, who it benefits, any ambiguities, and a summary.
   - Returns a response as a JSON array.
4. Once the analysis is done, Docalyzer prints a table, which shows all the points analyzed
   - Has filtering features, including by **clause number**, **risk score** in descending order, and the **ambiguity** of the clauses.

---
## Impact

Many people do not read all the clauses when they sign a contract. Some only skim the main points. This can be attributed to less free time during work, the long legalese of the contracts, etc. Therefore, Docalyzer helps analyze the contract, with only a few clicks from the user's end. Unlike other document analyzing products, which just provide responses as-is Docalyzer organizes data in a table, along with easy-to-use filters, so that clauses with high risks are emphasized, and red flags are easily noticed. 

---
## How to set it up

There are only a few steps required to set it up: 
- Download this repository
- Download Node.js(if not already installed)
- Configure your own Gemini API key, which you can find on [aistudio.google.com](https://aistudio.google.com/).
- Using the same format as the env.example file, create your own .env file and insert your API key and port.
- With a terminal(Powershell, Mac, Linux), enter the following command: `npm i`. This installs all the dependencies in the code.
- Run the command `npm run dev` to run the dev dependency Nodemon, which automatically restarts your node application when it detects any changes.
- Open `localhost:PORT_NAME` and replace `PORT_NAME` with your port name
