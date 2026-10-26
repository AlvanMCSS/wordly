
const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const status = document.getElementById("status");
const result = document.getElementById("result");
const savedWordsList = document.getElementById("savedWords");
const themeButton = document.getElementById("themeButton");

let savedWords = JSON.parse(localStorage.getItem("savedWords")) || [];

function saveWords() {
    localStorage.setItem("savedWords", JSON.stringify(savedWords));
}

function displaySavedWords() {
    savedWordsList.innerHTML = "";

    savedWords.forEach(function(word) {
        const li = document.createElement("li");
        const wordButton = document.createElement("button");
        const removeButton = document.createElement("button");

        wordButton.textContent = word;
        wordButton.addEventListener("click", function() {
            wordInput.value = word;
            searchWord(word);
        });

        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", function() {
            savedWords = savedWords.filter(function(item) {
                return item !== word;
            });

            saveWords();
            displaySavedWords();
        });

        li.appendChild(wordButton);
        li.appendChild(removeButton);
        savedWordsList.appendChild(li);
    });
}

async function searchWord(word) {
    const searchTerm = word.trim();

    if (!searchTerm) {
        status.textContent = "Please enter a word.";
        result.innerHTML = "";
        return;
    }

    status.textContent = "Searching...";
    result.innerHTML = "";

    try {
        const response = await fetch(
            "https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(searchTerm)
        );

        if (!response.ok) {
            throw new Error("Word not found. Please try another word.");
        }

        const data = await response.json();
        displayWord(data[0]);
        status.textContent = "";
    } catch (error) {
        status.textContent =
            error.message === "Failed to fetch"
                ? "Unable to connect. Check your internet and try again."
                : error.message;

        result.innerHTML = "";
    }
}

function displayWord(wordData) {
    result.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = wordData.word;
    result.appendChild(heading);

    if (wordData.phonetic) {
        const phonetic = document.createElement("p");
        phonetic.textContent = "Pronunciation: " + wordData.phonetic;
        result.appendChild(phonetic);
    }

    const audio = wordData.phonetics.find(function(item) {
        return item.audio;
    });

    if (audio) {
        const audioButton = document.createElement("button");
        audioButton.textContent = "Play Pronunciation";

        audioButton.addEventListener("click", function() {
            const sound = new Audio(audio.audio);
            sound.play().catch(function() {
                status.textContent = "Audio could not be played.";
            });
        });

        result.appendChild(audioButton);
    }

    wordData.meanings.forEach(function(meaning) {
        const partOfSpeech = document.createElement("h3");
        partOfSpeech.textContent = meaning.partOfSpeech;
        result.appendChild(partOfSpeech);

        meaning.definitions.forEach(function(definition) {
            const card = document.createElement("div");
            card.className = "definition";

            const definitionText = document.createElement("p");
            definitionText.textContent = definition.definition;
            card.appendChild(definitionText);

            if (definition.example) {
                const example = document.createElement("p");
                example.textContent = "Example: " + definition.example;
                card.appendChild(example);
            }

            result.appendChild(card);
        });

        if (meaning.synonyms && meaning.synonyms.length > 0) {
            const synonyms = document.createElement("p");
            synonyms.textContent =
                "Synonyms: " + meaning.synonyms.join(", ");
            result.appendChild(synonyms);
        }
    });

    if (!savedWords.includes(wordData.word)) {
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Word";

        saveButton.addEventListener("click", function() {
            savedWords.push(wordData.word);
            saveWords();
            displaySavedWords();
            saveButton.disabled = true;
            saveButton.textContent = "Saved";
        });

        result.appendChild(saveButton);
    }
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchWord(wordInput.value);
});

themeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
});

displaySavedWords();
