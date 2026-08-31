const answersContainer =
    document.getElementById("answersContainer");

const previewButton =
    document.getElementById("previewButton");

const downloadButton =
    document.getElementById("downloadButton");

const submitButton =
    document.getElementById("submitButton");


// ========================================
// LOAD ANSWERS
// ========================================

let answers = [];

const savedAnswers =
    sessionStorage.getItem("formAnswers");


if (!savedAnswers) {

    answersContainer.innerHTML = `
        <div class="error-message">
            ❌ No answers found.
            <br><br>
            Please go back and complete the form.
        </div>
    `;

    disableButtons();

} else {

    try {

        answers = JSON.parse(savedAnswers);

        if (
            !Array.isArray(answers) ||
            answers.length === 0
        ) {
            throw new Error("Answers array is empty.");
        }

        console.log("Loaded answers:", answers);

        displayAnswers();

    } catch (error) {

        console.error(
            "Error loading answers:",
            error
        );

        answersContainer.innerHTML = `
            <div class="error-message">
                ❌ Could not read your answers.
            </div>
        `;

        disableButtons();
    }
}


// ========================================
// DISPLAY ANSWERS
// ========================================

function displayAnswers() {

    answersContainer.innerHTML = "";

    answers.forEach((item, index) => {

        const card =
            document.createElement("section");

        card.className = "answer-card";


        const number =
            document.createElement("div");

        number.className = "answer-number";

        number.textContent =
            `Question ${index + 1}`;


        const question =
            document.createElement("h3");

        question.textContent =
            item.question;


        const label =
            document.createElement("span");

        label.className =
            "answer-label";

        label.textContent =
            "Your answer";


        const answer =
            document.createElement("strong");

        answer.textContent =
            item.answer;


        card.appendChild(number);
        card.appendChild(question);
        card.appendChild(label);
        card.appendChild(answer);


        answersContainer.appendChild(card);

    });

}


// ========================================
// DISABLE BUTTONS
// ========================================

function disableButtons() {

    previewButton.disabled = true;
    downloadButton.disabled = true;
    submitButton.disabled = true;

}


// ========================================
// CREATE PDF CONTENT
// ========================================

// ========================================
// CREATE PDF USING jsPDF
// ========================================

function createPDF() {

    const { jsPDF } = window.jspdf;

    const pdf =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    // ========================================
    // PAGE SETTINGS
    // ========================================

    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();

    const margin = 18;

    const contentWidth =
        pageWidth - margin * 2;


    let y = 20;


    // ========================================
    // HEADER
    // ========================================

    pdf.setFillColor(
        118,
        85,
        199
    );


    pdf.rect(
        0,
        0,
        pageWidth,
        38,
        "F"
    );


    pdf.setTextColor(
        255,
        255,
        255
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(22);


    pdf.text(
        "Form Submission",
        pageWidth / 2,
        17,
        {
            align: "center"
        }
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(10);


    pdf.text(
        "Review of submitted answers",
        pageWidth / 2,
        25,
        {
            align: "center"
        }
    );


    pdf.text(
        new Date().toLocaleString(),
        pageWidth / 2,
        31,
        {
            align: "center"
        }
    );


    y = 50;


    // ========================================
    // QUESTIONS
    // ========================================

    answers.forEach(
        (item, index) => {

            // --------------------------------
            // Prepare question text
            // --------------------------------

            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(12);


            const questionLines =
                pdf.splitTextToSize(
                    item.question,
                    contentWidth - 5
                );


            // --------------------------------
            // Calculate required height
            // --------------------------------

            const questionHeight =
                questionLines.length * 6;


            const blockHeight =
                questionHeight + 24;


            // --------------------------------
            // New page if necessary
            // --------------------------------

            if (
                y + blockHeight >
                pageHeight - 20
            ) {

                pdf.addPage();

                y = 20;

            }


            // --------------------------------
            // Question number
            // --------------------------------

            pdf.setFillColor(
                238,
                232,
                255
            );


            pdf.roundedRect(
                margin,
                y,
                30,
                7,
                3,
                3,
                "F"
            );


            pdf.setTextColor(
                118,
                85,
                199
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(8);


            pdf.text(
                `Question ${index + 1}`,
                margin + 15,
                y + 4.8,
                {
                    align: "center"
                }
            );


            y += 12;


            // --------------------------------
            // Question text
            // --------------------------------

            pdf.setTextColor(
                41,
                34,
                61
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(12);


            pdf.text(
                questionLines,
                margin,
                y
            );


            y += questionHeight + 5;


            // --------------------------------
            // Answer box
            // --------------------------------

            const answerLines =
                pdf.splitTextToSize(
                    String(item.answer),
                    contentWidth - 18
                );


            const answerHeight =
                Math.max(
                    12,
                    answerLines.length * 5 + 7
                );


            pdf.setFillColor(
                247,
                244,
                255
            );


            pdf.setDrawColor(
                118,
                85,
                199
            );


            pdf.setLineWidth(1);


            pdf.roundedRect(
                margin,
                y,
                contentWidth,
                answerHeight,
                3,
                3,
                "FD"
            );


            // --------------------------------
            // Check mark
            // --------------------------------

            pdf.setTextColor(
                46,
                157,
                87
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(14);


            pdf.text(
                "✓",
                margin + 5,
                y + 7
            );


            // --------------------------------
            // Answer text
            // --------------------------------

            pdf.setTextColor(
                118,
                85,
                199
            );


            pdf.setFontSize(11);


            pdf.text(
                answerLines,
                margin + 12,
                y + 7
            );


            y += answerHeight + 10;


            // --------------------------------
            // Separator
            // --------------------------------

            pdf.setDrawColor(
                225,
                220,
                235
            );


            pdf.setLineWidth(0.3);


            pdf.line(
                margin,
                y,
                pageWidth - margin,
                y
            );


            y += 8;

        }
    );


    // ========================================
    // FOOTER ON EACH PAGE
    // ========================================

    const totalPages =
        pdf.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        pdf.setPage(page);


        pdf.setTextColor(
            150,
            150,
            150
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(8);


        pdf.text(
            `Page ${page} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            {
                align: "center"
            }
        );

    }


    return pdf;

}


// ========================================
// PREVIEW PDF
// ========================================

previewButton.addEventListener(
    "click",
    function() {

        try {

            previewButton.disabled = true;

            previewButton.textContent =
                "⏳ Creating...";


            const pdf =
                createPDF();


            const blob =
                pdf.output("blob");


            const url =
                URL.createObjectURL(blob);


            window.open(
                url,
                "_blank"
            );


        } catch (error) {

            console.error(
                "PDF PREVIEW ERROR:",
                error
            );


            alert(
                "❌ PDF preview failed.\n\n" +
                error.message
            );

        } finally {

            previewButton.disabled =
                false;

            previewButton.textContent =
                "👁 Preview";

        }

    }
);


// ========================================
// DOWNLOAD PDF
// ========================================

downloadButton.addEventListener(
    "click",
    function() {

        try {

            downloadButton.disabled =
                true;

            downloadButton.textContent =
                "⏳ Creating...";


            const pdf =
                createPDF();


            pdf.save(
                "form-submission.pdf"
            );


        } catch (error) {

            console.error(
                "PDF DOWNLOAD ERROR:",
                error
            );


            alert(
                "❌ PDF download failed.\n\n" +
                error.message
            );

        } finally {

            downloadButton.disabled =
                false;

            downloadButton.textContent =
                "⬇ Download";

        }

    }
);



// ========================================
// SUBMIT TO SUPABASE
// ========================================

submitButton.addEventListener(
    "click",
    submitAnswers
);


async function submitAnswers() {

    if (!answers.length) {

        alert(
            "❌ There are no answers to submit."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to submit your answers?"
        );


    if (!confirmed) {
        return;
    }


    submitButton.disabled =
        true;

    submitButton.textContent =
        "⏳ Submitting...";


    try {

        console.log(
            "Submitting:",
            answers
        );


        console.log(
            "Supabase client:",
            supabaseClient
        );


        const result =
            await supabaseClient
                .from("submissions")
                .insert({
                    answers: answers
                });


        console.log(
            "Supabase result:",
            result
        );


        if (result.error) {

            throw result.error;

        }


        console.log(
            "Submission successful!"
        );


        submitButton.textContent =
            "✅ Submitted";


        submitButton.classList.add(
            "submitted-button"
        );


        showSuccessMessage();


        sessionStorage.setItem(
            "formSubmitted",
            "true"
        );


    } catch (error) {

        console.error(
            "SUPABASE SUBMISSION ERROR:",
            error
        );


        alert(
            "❌ Submission failed.\n\n" +
            "Error: " +
            error.message
        );


        submitButton.disabled =
            false;

        submitButton.textContent =
            "📤 Submit";

    }

}


// ========================================
// SUCCESS MESSAGE
// ========================================

function showSuccessMessage() {

    const message =
        document.createElement("div");


    message.className =
        "success-message";


    message.innerHTML = `

        <strong>
            🎉 Your form was submitted successfully!
        </strong>

        <p>
            Your answers have been securely sent.
        </p>

    `;


    answersContainer.prepend(
        message
    );

}
