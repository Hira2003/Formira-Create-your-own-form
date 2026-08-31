// ========================================
// ELEMENTS
// ========================================

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const adminEmail =
    document.getElementById("adminEmail");

const adminQuestionsContainer =
    document.getElementById(
        "adminQuestionsContainer"
    );

const addQuestionButton =
    document.getElementById(
        "addQuestionButton"
    );

const questionEditor =
    document.getElementById(
        "questionEditor"
    );

const editorTitle =
    document.getElementById(
        "editorTitle"
    );

const questionText =
    document.getElementById(
        "questionText"
    );

const choicesEditorContainer =
    document.getElementById(
        "choicesEditorContainer"
    );

const addChoiceButton =
    document.getElementById(
        "addChoiceButton"
    );

const cancelEditorButton =
    document.getElementById(
        "cancelEditorButton"
    );

const saveQuestionButton =
    document.getElementById(
        "saveQuestionButton"
    );

const editorMessage =
    document.getElementById(
        "editorMessage"
    );


// ========================================
// STATE
// ========================================

let editingQuestionId = null;


// ========================================
// SESSION
// ========================================

async function checkSession() {

    const {
        data,
        error
    } = await supabaseClient
        .auth
        .getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

        return;
    }


    if (data.session) {

        showDashboard(
            data.session
        );

    } else {

        showLogin();

    }

}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        loginButton.disabled =
            true;


        loginButton.textContent =
            "⏳ Logging in...";


        loginMessage.textContent =
            "";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                throw error;

            }


            showDashboard(
                data.session
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                "❌ " + error.message;


            loginMessage.className =
                "form-message error";


        } finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "🔐 Login";

        }

    }
);


// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {

    loginSection.style.display =
        "block";

    dashboardSection.style.display =
        "none";

}


// ========================================
// SHOW DASHBOARD
// ========================================

function showDashboard(session) {

    loginSection.style.display =
        "none";

    dashboardSection.style.display =
        "block";


    if (
        session &&
        session.user
    ) {

        adminEmail.textContent =
            session.user.email;

    }


    loadAdminQuestions();

}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async function() {

        const {
            error
        } = await supabaseClient
            .auth
            .signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return;
        }


        showLogin();

    }
);


// ========================================
// LOAD QUESTIONS
// ========================================

async function loadAdminQuestions() {

    adminQuestionsContainer.innerHTML = `
        <p class="loading">
            Loading questions... ⏳
        </p>
    `;


    const {
        data: questions,
        error
    } = await supabaseClient
        .from("questions")
        .select("*")
        .order(
            "question_order",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Questions error:",
            error
        );


        adminQuestionsContainer.innerHTML = `
            <p class="error-message">
                ❌ ${escapeHTML(
                    error.message
                )}
            </p>
        `;

        return;

    }


    adminQuestionsContainer.innerHTML = "";


    if (
        !questions ||
        questions.length === 0
    ) {

        adminQuestionsContainer.innerHTML = `
            <p>
                No questions yet.
            </p>
        `;

        return;
    }


    for (
        let i = 0;
        i < questions.length;
        i++
    ) {

        await createAdminQuestionCard(
            questions[i],
            i
        );

    }

}


// ========================================
// CREATE ADMIN QUESTION CARD
// ========================================

async function createAdminQuestionCard(
    question,
    index
) {

    const card =
        document.createElement("div");


    card.className =
        "admin-question";


    // Get choices

    const {
        data: choices,
        error
    } = await supabaseClient
        .from("choices")
        .select("*")
        .eq(
            "question_id",
            question.id
        )
        .order(
            "choice_order",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Choices error:",
            error
        );

    }


    const choicesHTML =
        (choices || [])
            .map(
                choice => `
                    <li>
                        ${escapeHTML(
                            choice.choice_text
                        )}
                    </li>
                `
            )
            .join("");


    card.innerHTML = `

        <div class="admin-question-content">

            <span class="question-number">
                Question ${index + 1}
            </span>


            <h3>
                ${escapeHTML(
                    question.question
                )}
            </h3>


            <ul class="admin-choice-list">
                ${choicesHTML}
            </ul>

        </div>


        <div class="admin-question-actions">

            <button
                class="secondary-button edit-question"
            >
                ✏️ Edit
            </button>


            <button
                class="delete-button delete-question"
            >
                🗑 Delete
            </button>

        </div>

    `;


    // EDIT

    card.querySelector(
        ".edit-question"
    ).addEventListener(
        "click",
        function() {

            openEditQuestion(
                question
            );

        }
    );


    // DELETE

    card.querySelector(
        ".delete-question"
    ).addEventListener(
        "click",
        function() {

            deleteQuestion(
                question.id
            );

        }
    );


    adminQuestionsContainer.appendChild(
        card
    );

}


// ========================================
// OPEN ADD QUESTION
// ========================================

addQuestionButton.addEventListener(
    "click",
    function() {

        openAddQuestion();

    }
);


function openAddQuestion() {

    editingQuestionId =
        null;


    editorTitle.textContent =
        "➕ Add Question";


    questionText.value =
        "";


    choicesEditorContainer.innerHTML =
        "";


    addChoiceInput();

    addChoiceInput();


    editorMessage.textContent =
        "";


    questionEditor.style.display =
        "block";


    questionEditor.scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// OPEN EDIT QUESTION
// ========================================

async function openEditQuestion(
    question
) {

    editingQuestionId =
        question.id;


    editorTitle.textContent =
        "✏️ Edit Question";


    questionText.value =
        question.question;


    choicesEditorContainer.innerHTML =
        "";


    editorMessage.textContent =
        "";


    const {
        data: choices,
        error
    } = await supabaseClient
        .from("choices")
        .select("*")
        .eq(
            "question_id",
            question.id
        )
        .order(
            "choice_order",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Edit choices error:",
            error
        );


        editorMessage.textContent =
            "❌ " + error.message;

        return;

    }


    if (
        choices &&
        choices.length > 0
    ) {

        choices.forEach(
            choice => {

                addChoiceInput(
                    choice.choice_text
                );

            }
        );

    } else {

        addChoiceInput();

    }


    questionEditor.style.display =
        "block";


    questionEditor.scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// ADD CHOICE BUTTON
// ========================================

addChoiceButton.addEventListener(
    "click",
    function() {

        addChoiceInput();

    }
);


// ========================================
// ADD CHOICE INPUT
// ========================================

function addChoiceInput(
    value = ""
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "choice-editor-row";


    wrapper.innerHTML = `

        <input
            type="text"
            class="choice-input"
            placeholder="Enter choice..."
            value="${escapeHTML(
                value
            )}"
        >


        <button
            type="button"
            class="remove-choice"
        >
            ✕
        </button>

    `;


    wrapper.querySelector(
        ".remove-choice"
    ).addEventListener(
        "click",
        function() {

            wrapper.remove();

        }
    );


    choicesEditorContainer.appendChild(
        wrapper
    );

}


// ========================================
// CANCEL EDITOR
// ========================================

cancelEditorButton.addEventListener(
    "click",
    function() {

        closeEditor();

    }
);


function closeEditor() {

    editingQuestionId =
        null;


    questionEditor.style.display =
        "none";


    editorMessage.textContent =
        "";

}


// ========================================
// SAVE QUESTION
// ========================================

saveQuestionButton.addEventListener(
    "click",
    async function() {

        const question =
            questionText.value.trim();


        const choiceInputs =
            document.querySelectorAll(
                ".choice-input"
            );


        const choices = [];


        choiceInputs.forEach(
            input => {

                const value =
                    input.value.trim();


                if (value) {

                    choices.push(value);

                }

            }
        );


        // ====================================
        // VALIDATION
        // ====================================

        if (!question) {

            showEditorError(
                "Please enter a question."
            );

            return;

        }


        if (choices.length < 2) {

            showEditorError(
                "Please add at least two choices."
            );

            return;

        }


        saveQuestionButton.disabled =
            true;


        saveQuestionButton.textContent =
            "⏳ Saving...";


        editorMessage.textContent =
            "";


        try {

            if (editingQuestionId) {

                await updateQuestion(
                    question,
                    choices
                );

            } else {

                await insertQuestion(
                    question,
                    choices
                );

            }


            closeEditor();

            await loadAdminQuestions();


        } catch (error) {

            console.error(
                "Save question error:",
                error
            );


            showEditorError(
                error.message
            );

        } finally {

            saveQuestionButton.disabled =
                false;

            saveQuestionButton.textContent =
                "💾 Save Question";

        }

    }
);


// ========================================
// INSERT QUESTION
// ========================================

async function insertQuestion(
    question,
    choices
) {

    // Get highest order

    const {
        data: lastQuestion,
        error: orderError
    } = await supabaseClient
        .from("questions")
        .select("question_order")
        .order(
            "question_order",
            {
                ascending: false
            }
        )
        .limit(1);


    if (orderError) {

        throw orderError;

    }


    let nextOrder = 1;


    if (
        lastQuestion &&
        lastQuestion.length > 0
    ) {

        nextOrder =
            lastQuestion[0]
                .question_order + 1;

    }


    // Insert question

    const {
        data: newQuestion,
        error
    } = await supabaseClient
        .from("questions")
        .insert({
            question: question,
            question_order: nextOrder
        })
        .select()
        .single();


    if (error) {

        throw error;

    }


    // Insert choices

    const choicesData =
        choices.map(
            (choice, index) => ({

                question_id:
                    newQuestion.id,

                choice_text:
                    choice,

                choice_order:
                    index + 1

            })
        );


    const {
        error: choicesError
    } = await supabaseClient
        .from("choices")
        .insert(
            choicesData
        );


    if (choicesError) {

        // Roll back question manually
        await supabaseClient
            .from("questions")
            .delete()
            .eq(
                "id",
                newQuestion.id
            );

        throw choicesError;

    }

}


// ========================================
// UPDATE QUESTION
// ========================================

async function updateQuestion(
    question,
    choices
) {

    // Update question

    const {
        error
    } = await supabaseClient
        .from("questions")
        .update({
            question: question
        })
        .eq(
            "id",
            editingQuestionId
        );


    if (error) {

        throw error;

    }


    // Get old choices

    const {
        data: oldChoices,
        error: oldChoicesError
    } = await supabaseClient
        .from("choices")
        .select("id")
        .eq(
            "question_id",
            editingQuestionId
        );


    if (oldChoicesError) {

        throw oldChoicesError;

    }


    // Delete old choices

    if (
        oldChoices &&
        oldChoices.length > 0
    ) {

        const ids =
            oldChoices.map(
                choice => choice.id
            );


        const {
            error: deleteError
        } = await supabaseClient
            .from("choices")
            .delete()
            .in(
                "id",
                ids
            );


        if (deleteError) {

            throw deleteError;

        }

    }


    // Insert new choices

    const newChoices =
        choices.map(
            (choice, index) => ({

                question_id:
                    editingQuestionId,

                choice_text:
                    choice,

                choice_order:
                    index + 1

            })
        );


    const {
        error: insertError
    } = await supabaseClient
        .from("choices")
        .insert(
            newChoices
        );


    if (insertError) {

        throw insertError;

    }

}


// ========================================
// DELETE QUESTION
// ========================================

async function deleteQuestion(
    questionId
) {

    const confirmed =
        confirm(
            "⚠️ Are you sure you want to delete this question?\n\nIts choices will also be removed."
        );


    if (!confirmed) {

        return;

    }


    try {

        // Delete choices first

        const {
            error: choicesError
        } = await supabaseClient
            .from("choices")
            .delete()
            .eq(
                "question_id",
                questionId
            );


        if (choicesError) {

            throw choicesError;

        }


        // Delete question

        const {
            error
        } = await supabaseClient
            .from("questions")
            .delete()
            .eq(
                "id",
                questionId
            );


        if (error) {

            throw error;

        }


        await loadAdminQuestions();


    } catch (error) {

        console.error(
            "Delete question error:",
            error
        );


        alert(
            "❌ Could not delete question.\n\n" +
            error.message
        );

    }

}


// ========================================
// EDITOR ERROR
// ========================================

function showEditorError(
    message
) {

    editorMessage.textContent =
        "❌ " + message;


    editorMessage.className =
        "form-message error";

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


// ========================================
// START
// ========================================

checkSession();
