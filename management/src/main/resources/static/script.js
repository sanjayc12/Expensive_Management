const API_URL = "";


/* =====================================================
   COMMON FUNCTIONS
===================================================== */

function getToken() {
    return localStorage.getItem("token");
}


function logout() {

    localStorage.removeItem("token");

    window.location.href = "index.html";
}


/*
 * Decode JWT payload.
 * This does NOT verify the token.
 * The backend still verifies the JWT.
 */
function decodeToken(token) {

    try {

        const payload = token.split(".")[1];

        const decodedPayload =
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

        return JSON.parse(decodedPayload);

    } catch (error) {

        return null;
    }
}


function getUserRole() {

    const token = getToken();

    if (!token) {
        return null;
    }

    const payload = decodeToken(token);

    if (!payload) {
        return null;
    }

    return payload.role;
}


function getUserEmail() {

    const token = getToken();

    if (!token) {
        return null;
    }

    const payload = decodeToken(token);

    if (!payload) {
        return null;
    }

    return payload.sub;
}


function authHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("loginMessage");

            try {

                const response = await fetch(
                    API_URL + "/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    message.innerText =
                        errorText || "Invalid email or password";

                    return;
                }


                const result =
                    await response.json();


                if (!result.token) {

                    message.innerText =
                        "JWT token was not received";

                    return;
                }


                localStorage.setItem(
                    "token",
                    result.token
                );


                const payload =
                    decodeToken(result.token);


                if (!payload) {

                    message.innerText =
                        "Invalid JWT token";

                    localStorage.removeItem("token");

                    return;
                }


                if (payload.role === "USER") {

                    window.location.href =
                        "user-dashboard.html";

                } else if (payload.role === "MANAGER") {

                    window.location.href =
                        "manager-dashboard.html";

                } else {

                    message.innerText =
                        "Unknown user role";

                    localStorage.removeItem("token");
                }

            } catch (error) {

                console.error(error);

                message.innerText =
                    "Cannot connect to server";
            }
        }
    );
}


/* =====================================================
   REGISTER
===================================================== */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("registerEmail")
                    .value.trim();

            const password =
                document.getElementById("registerPassword")
                    .value;

            const role =
                document.getElementById("role").value;

            const message =
                document.getElementById("registerMessage");


            try {

                const response = await fetch(
                    API_URL + "/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password,
                            role: role
                        })
                    }
                );


                const result =
                    await response.text();


                message.innerText = result;


                if (response.ok) {

                    setTimeout(
                        function() {
                            window.location.href =
                                "index.html";
                        },
                        1000
                    );
                }

            } catch (error) {

                console.error(error);

                message.innerText =
                    "Cannot connect to server";
            }
        }
    );
}


/* =====================================================
   USER DASHBOARD
===================================================== */

if (window.location.pathname.endsWith(
    "user-dashboard.html")) {

    const token = getToken();

    if (!token) {

        window.location.href = "index.html";

    } else {

        const role = getUserRole();

        if (role !== "USER") {

            window.location.href =
                "manager-dashboard.html";

        } else {

            const email =
                document.getElementById("userEmail");

            if (email) {
                email.innerText =
                    getUserEmail();
            }

            loadMyExpenses();
        }
    }
}


/* =====================================================
   CREATE EXPENSE
===================================================== */

const expenseForm =
    document.getElementById("expenseForm");

if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const amount =
                document.getElementById("amount").value;

            const description =
                document.getElementById("description")
                    .value.trim();

            const message =
                document.getElementById("expenseMessage");


            try {

                const url =
                    API_URL +
                    "/expenses?amount=" +
                    encodeURIComponent(amount) +
                    "&description=" +
                    encodeURIComponent(description);


                const response =
                    await fetch(
                        url,
                        {
                            method: "POST",
                            headers: authHeaders()
                        }
                    );


                if (response.status === 401) {

                    logout();
                    return;
                }


                if (response.status === 403) {

                    message.innerText =
                        "You are not authorized.";

                    return;
                }


                if (!response.ok) {

                    const error =
                        await response.text();

                    message.innerText =
                        error || "Failed to submit expense";

                    return;
                }


                await response.json();


                message.innerText =
                    "Expense submitted successfully";


                expenseForm.reset();


                loadMyExpenses();


            } catch (error) {

                console.error(error);

                message.innerText =
                    "Cannot connect to server";
            }
        }
    );
}


/* =====================================================
   GET MY EXPENSES
===================================================== */

async function loadMyExpenses() {

    const tableBody =
        document.getElementById("expenseTableBody");

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        "<tr><td colspan='6'>Loading...</td></tr>";


    try {

        const response =
            await fetch(
                API_URL + "/expenses/my",
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            logout();
            return;
        }


        if (response.status === 403) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>Access denied</td></tr>";

            return;
        }


        if (!response.ok) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>Failed to load expenses</td></tr>";

            return;
        }


        const expenses =
            await response.json();


        tableBody.innerHTML = "";


        if (expenses.length === 0) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>No expenses found</td></tr>";

            return;
        }


        expenses.forEach(function(expense) {

            const row =
                document.createElement("tr");


            const status =
                expense.status || "PENDING";


            row.innerHTML = `
                <td>${expense.id}</td>

                <td>₹${expense.amount}</td>

                <td>${escapeHtml(expense.description)}</td>

                <td>
                    <span class="status status-${status}">
                        ${status}
                    </span>
                </td>

                <td>
                    ${
                expense.managerComment
                    ? escapeHtml(expense.managerComment)
                    : "-"
            }
                </td>

                <td>
                    ${
                expense.createdAt
                    ? formatDate(expense.createdAt)
                    : "-"
            }
                </td>
            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(error);

        tableBody.innerHTML =
            "<tr><td colspan='6'>Cannot connect to server</td></tr>";
    }
}


/* =====================================================
   MANAGER DASHBOARD
===================================================== */

if (window.location.pathname.endsWith(
    "manager-dashboard.html")) {

    const token = getToken();

    if (!token) {

        window.location.href = "index.html";

    } else {

        const role = getUserRole();

        if (role !== "MANAGER") {

            window.location.href =
                "user-dashboard.html";

        } else {

            const email =
                document.getElementById("managerEmail");

            if (email) {
                email.innerText =
                    getUserEmail();
            }

            loadPendingExpenses();
        }
    }
}


/* =====================================================
   GET PENDING EXPENSES
===================================================== */

async function loadPendingExpenses() {

    const tableBody =
        document.getElementById("pendingTableBody");

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        "<tr><td colspan='6'>Loading...</td></tr>";


    try {

        const response =
            await fetch(
                API_URL +
                "/manager/expenses/pending",
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            logout();
            return;
        }


        if (response.status === 403) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>Manager access required</td></tr>";

            return;
        }


        if (!response.ok) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>Failed to load expenses</td></tr>";

            return;
        }


        const expenses =
            await response.json();


        tableBody.innerHTML = "";


        if (expenses.length === 0) {

            tableBody.innerHTML =
                "<tr><td colspan='6'>No pending expenses</td></tr>";

            return;
        }


        expenses.forEach(function(expense) {

            const row =
                document.createElement("tr");


            const userEmail =
                expense.user &&
                expense.user.email
                    ? expense.user.email
                    : "-";


            row.innerHTML = `
                <td>${expense.id}</td>

                <td>${escapeHtml(userEmail)}</td>

                <td>₹${expense.amount}</td>

                <td>${escapeHtml(expense.description)}</td>

                <td>
                    ${
                expense.createdAt
                    ? formatDate(expense.createdAt)
                    : "-"
            }
                </td>

                <td>

                    <button
                        class="accept-btn"
                        onclick="acceptExpense(${expense.id})">
                        Accept
                    </button>

                    <button
                        class="reject-btn"
                        onclick="openRejectModal(${expense.id})">
                        Reject
                    </button>

                </td>
            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(error);

        tableBody.innerHTML =
            "<tr><td colspan='6'>Cannot connect to server</td></tr>";
    }
}


/* =====================================================
   ACCEPT EXPENSE
===================================================== */

async function acceptExpense(id) {

    if (!confirm(
        "Are you sure you want to accept this expense?"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL +
                "/manager/expenses/" +
                id +
                "/accept",
                {
                    method: "PUT",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            logout();
            return;
        }


        if (response.status === 403) {

            alert("Manager access required.");
            return;
        }


        if (!response.ok) {

            const error =
                await response.text();

            alert(
                error ||
                "Failed to accept expense"
            );

            return;
        }


        alert("Expense accepted successfully");


        loadPendingExpenses();


    } catch (error) {

        console.error(error);

        alert("Cannot connect to server");
    }
}


/* =====================================================
   OPEN REJECT MODAL
===================================================== */

function openRejectModal(id) {

    document.getElementById(
        "rejectExpenseId"
    ).value = id;


    document.getElementById(
        "rejectComment"
    ).value = "";


    document.getElementById(
        "rejectModal"
    ).style.display = "flex";
}


/* =====================================================
   CLOSE REJECT MODAL
===================================================== */

function closeRejectModal() {

    document.getElementById(
        "rejectModal"
    ).style.display = "none";
}


/* =====================================================
   REJECT EXPENSE
===================================================== */

async function confirmReject() {

    const id =
        document.getElementById(
            "rejectExpenseId"
        ).value;


    const comment =
        document.getElementById(
            "rejectComment"
        ).value.trim();


    if (!comment) {

        alert("Please enter a rejection reason.");

        return;
    }


    try {

        const url =
            API_URL +
            "/manager/expenses/" +
            id +
            "/reject?comment=" +
            encodeURIComponent(comment);


        const response =
            await fetch(
                url,
                {
                    method: "PUT",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            logout();
            return;
        }


        if (response.status === 403) {

            alert("Manager access required.");

            return;
        }


        if (!response.ok) {

            const error =
                await response.text();

            alert(
                error ||
                "Failed to reject expense"
            );

            return;
        }


        closeRejectModal();


        alert("Expense rejected successfully");


        loadPendingExpenses();


    } catch (error) {

        console.error(error);

        alert("Cannot connect to server");
    }
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateValue) {

    try {

        return new Date(dateValue)
            .toLocaleString();

    } catch (error) {

        return dateValue;
    }
}