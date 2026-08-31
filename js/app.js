const questionsContainer = document.getElementById("questionsContainer");
const quizForm = document.getElementById("quizForm");


// ========================================
// LOAD QUESTIONS FROM SUPABASE
// ========================================

async function loadQuestions() {

    questionsContainer.innerHTML = `
        <p class="loading">
            Loading questions... ⏳
        </p>
    `;


    const { data: questions, error } = await supabaseClient
        .from("questions")
        .select("*")
        .order("question_order", {
            ascending: true
        });


    if (error) {

        console.error("Questions error:", error);

        questionsContainer.innerHTML = `
            <div class="error-message">
                ❌ Failed to load questions.
                <br><br>
                Please try again later.
            </div>
        `;

        return;
    }


    if (!questions || questions.length === 0) {

        questionsContainer.innerHTML = `
            <div class="error-message">
                ⚠️ There are currently no questions.
            </div>
        `;

        return;
    }


    questionsContainer.innerHTML = "";


    // ========================================
    // LOAD EACH QUESTION'S CHOICES
    // ========================================

    for (const question of questions) {

        const {
            data: choices,
            error: choicesError
        } = await supabaseClient
            .from("choices")
            .select("*")
            .eq("question_id", question.id)
            .order("choice_order", {
                ascending: true
            });


        if (choicesError) {

            console.error(
                `Choices error for question ${question.id}:`,
                choicesError
            );

            continue;
        }


        createQuestion(
            question,
            choices || []
        );
    }

}


// ========================================
// CREATE QUESTION CARD
// ========================================

function createQuestion(question, choices) {

    const questionCard =
        document.createElement("section");

    questionCard.className = "question-card";


    // Question title

    const questionTitle =
        document.createElement("h2");

    questionTitle.textContent =
        question.question;


    questionCard.appendChild(questionTitle);


    // Choices container

    const choicesContainer =
        document.createElement("div");

    choicesContainer.className = "choices";


    // Create radio buttons

    choices.forEach(choice => {

        const label =
            document.createElement("label");

        label.className = "choice";


        const input =
            document.createElement("input");

        input.type = "radio";

        input.name =
            `question_${question.id}`;

        input.value =
            choice.choice_text;

        input.required = true;


        const text =
            document.createElement("span");

        text.textContent =
            choice.choice_text;


        label.appendChild(input);

        label.appendChild(text);

        choicesContainer.appendChild(label);

    });


    questionCard.appendChild(
        choicesContainer
    );


    questionsContainer.appendChild(
        questionCard
    );

}


// ========================================
// FINISHED BUTTON
// ========================================

quizForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const selectedAnswers = [];


        // Find every question card

        const questionCards =
            document.querySelectorAll(
                ".question-card"
            );


        questionCards.forEach(
            (card, index) => {

                const questionTitle =
                    card.querySelector("h2");


                const selectedInput =
                    card.querySelector(
                        "input[type='radio']:checked"
                    );


                if (!selectedInput) {
                    return;
                }


                selectedAnswers.push({

                    question:
                        questionTitle.textContent,

                    answer:
                        selectedInput.value

                });

            }
        );


        // ========================================
        // SAFETY CHECK
        // ========================================

        if (
            selectedAnswers.length !==
            questionCards.length
        ) {

            alert(
                "⚠️ Please answer all questions before continuing."
            );

            return;
        }


        // ========================================
        // SAVE ANSWERS
        // ========================================

        sessionStorage.setItem(
            "formAnswers",
            JSON.stringify(selectedAnswers)
        );


        // ========================================
        // GO TO RESULTS
        // ========================================

        window.location.href =
            "results.html";

    }
);


// ========================================
// START APPLICATION
// ========================================

loadQuestions();
