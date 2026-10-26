
const searchForm = document.querySelector("#searchForm");
const wordInput = document.querySelector("#wordInput");
const result = document.querySelector("#result");
const status = document.querySelector("#status");
const savedWords = document.querySelector("#savedWords");

// Gets the saved words from the browser. If there are none, it starts with an empty list.
let words = JSON.parse(localStorage.getItem("savedWords")) || [];

// This function displays all the words that have been saved.
function displaySavedWords() {
    savedWords.textContent = "";

    words.forEach(function(word) {
        const li = document.createElement("li");
        li.textContent = word;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {
            // Removes the selected word from the saved list.
            words = words.filter(function(savedWord) {
                return savedWord !== word;
            });

            localStorage.setItem("savedWords", JSON.stringify(words));
            displaySavedWords();
        });

        li.appendChild(removeButton);
        savedWords.appendChild(li);
    });
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Stops the form from refreshing the page.

    const word = wordInput.value.trim(); // wordInput.value gets what the user typed. And .trim() removes extra spaces in the beginning and the end.

    if (word === "") { // if checks something
        status.textContent = "Please enter a word."; // Displays a message if no word was entered.
        result.textContent = "";
        return; // return stops the function so that it doesn't continue searching.
    }

    status.textContent = "Searching..."; // Shows a message while waiting for the answer.
    result.textContent = "";

    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word); // Builds the dictionary address using the word entered by the user.

    fetch(url) // Tells JavaScript to request that information from the dictionary using the address we created.
        .then(function(response) { // .then waits for the response. response represents the answer from the dictionary.
            if (!response.ok) { // Checks if the dictionary found the word.
                throw new Error("Word not found");
            }

            return response.json(); // response.json reads the answer in a format JavaScript can work with. return passes that information to the next step.
        })

        .then(function(data) { // Holds the information from the dictionary.
            status.textContent = "";

            const entry = data[0];
            const definition = entry.meanings[0].definitions[0].definition;
            const synonyms = entry.meanings[0].synonyms || []; // Gets words with a similar meaning.
            const example = entry.meanings[0].definitions[0].example;

            const phonetic = entry.phonetics.find(function(item) {
                return item.text;
            }); // phonetics shows pronunciation information the browser provides.

            const audio = entry.phonetics.find(function(item) {
                return item.audio;
            });

            // Creates a container to display the word and its information.
            const card = document.createElement("div");
            card.className = "word-card";

            const title = document.createElement("h2");
            title.textContent = entry.word;

            const meaning = document.createElement("p");
            meaning.textContent = "Definition: " + definition;

            card.appendChild(title);
            card.appendChild(meaning);

            if (phonetic) { // Checks if pronunciation text is available.
                const pronunciation = document.createElement("p");
                pronunciation.textContent = "Pronunciation: " + phonetic.text;
                card.appendChild(pronunciation);
            }

            if (synonyms.length > 0) { // Checks if there are any synonyms.
                const synonymText = document.createElement("p");
                synonymText.textContent = "Synonyms: " + synonyms.join(", ");
                card.appendChild(synonymText);
            }

            if (example) { // Checks if there is an example sentence.
                const exampleText = document.createElement("p");
                exampleText.textContent = "Example: " + example;
                card.appendChild(exampleText);
            }

            if (audio) { // Checks if audio is available.
                const audioButton = document.createElement("button");
                audioButton.textContent = "Play pronunciation";

                audioButton.addEventListener("click", function() {
                    const sound = new Audio(audio.audio);
                    sound.play();
                });

                card.appendChild(audioButton);
            }

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save Word";

            saveButton.addEventListener("click", function() {
                // Checks whether the word is already saved before adding it.
                if (!words.includes(entry.word)) {
                    words.push(entry.word);
                    localStorage.setItem("savedWords", JSON.stringify(words));
                    displaySavedWords();
                    status.textContent = "Word saved!";
                } else {
                    status.textContent = "This word is already saved.";
                }
            });

            card.appendChild(saveButton);
            result.appendChild(card); // Adds the word card to the page.
        })

        .catch(function(error) {
            status.textContent = "Word not found. Please try another word.";
            result.textContent = "";
        });
});

// Displays saved words when the page opens.
displaySavedWords();
