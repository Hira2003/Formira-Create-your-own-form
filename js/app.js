const questionsContainer =
    document.getElementById("questionsContainer");

const quizForm =
    document.getElementById("quizForm");


// ================================
// LOAD QUESTIONS
// ================================

async function loadQuestions() {

    const { data: questions, error: questionsError } =
        await supabaseClient
            .from("questions")
            .select("*")
            .order("question_order", {
                ascending: true
            });


    if (questionsError) {

        console.error(questionsError);

        questionsContainer.innerHTML = `
            <div class="error-message">
                ❌ Failed to load questions.
            </div>
        `;

        return;
    }


    questionsContainer.innerHTML = "";


    for (const question of questions) {

        const { data: choices, error: choicesError } =
            await supabaseClient
                .from("choices")
                .select("*")
                .eq("question_id", question.id)
                .order("choice_order", {
                    ascending: true
                });


        if (choicesError) {

            console.error(choicesError);

            continue;
        }


        createQuestion(
            question,
            choices
        );
    }
}


// ================================
// CREATE QUESTION HTML
// ================================

function createQuestion(question, choices) {

    const questionCard =
        document.createElement("section");

    questionCard.className =
        "question-card";


    const questionTitle =
        document.createElement("h2");

    questionTitle.textContent =
        question.question;


    questionCard.appendChild(questionTitle);


    const choicesContainer =
        document.createElement("div");

    choicesContainer.className =
        "choices";


    choices.forEach(choice => {

        const label =
            document.createElement("label");

        label.className =
            "choice";


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


// ================================
// SUBMIT FORM
// ================================

quizForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const formData =
            new FormData(quizForm);


        const answers = {};


        for (const [key, value] of formData.entries()) {

            answers[key] = value;

        }


        console.log("Answers:", answers);


        // Save temporarily
        sessionStorage.setItem(
            "formAnswers",
            JSON.stringify(answers)
        );


        // Go to results page
        window.location.href =
            "results.html";

    }
);


// ================================
// START
// ================================

loadQuestions();
