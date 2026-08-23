const answersContainer =
    document.getElementById("answersContainer");

const previewButton =
    document.getElementById("previewButton");

const downloadButton =
    document.getElementById("downloadButton");

const submitButton =
    document.getElementById("submitButton");


// ========================================
// GET ANSWERS FROM SESSION STORAGE
// ========================================

const savedAnswers =
    sessionStorage.getItem("formAnswers");


if (!savedAnswers) {

    answersContainer.innerHTML = `
        <div class="error-message">

            ❌ No answers were found.

            <br><br>

            Please return to the form.

        </div>
    `;

    submitButton.disabled = true;

} else {

    const answers =
        JSON.parse(savedAnswers);

    displayAnswers(answers);

}


// ========================================
// DISPLAY ANSWERS
// ========================================

function displayAnswers(answers) {

    answersContainer.innerHTML = "";


    Object.entries(answers).forEach(
        ([questionId, answer], index) => {

            const card =
                document.createElement("section");

            card.className =
                "answer-card";


            card.innerHTML = `

                <div class="answer-number">
                    Question ${index + 1}
                </div>

                <div class="answer-content">

                    <span class="answer-label">
                        Your answer
                    </span>

                    <strong>
                        ${escapeHTML(answer)}
                    </strong>

                </div>

            `;


            answersContainer.appendChild(card);

        }
    );

}


// ========================================
// PROTECT HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// CREATE PDF
// ========================================

function createPDF() {

    const element =
        document.getElementById(
            "answersContainer"
        );


    const options = {

        margin: 10,

        filename:
            "my-form-answers.pdf",

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }

    };


    return html2pdf()
        .set(options)
        .from(element);

}


// ========================================
// PREVIEW
// ========================================

previewButton.addEventListener(
    "click",
    async function() {

        const pdf =
            await createPDF().outputPdf("blob");


        const url =
            URL.createObjectURL(pdf);


        window.open(url, "_blank");

    }
);


// ========================================
// DOWNLOAD
// ========================================

downloadButton.addEventListener(
    "click",
    function() {

        createPDF().save();

    }
);


// ========================================
// SUBMIT
// ========================================

submitButton.addEventListener(
    "click",
    function() {

        alert(
            "📤 Submit will be connected to Supabase in Stage 3!"
        );

    }
);
