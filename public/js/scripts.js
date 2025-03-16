async function loadAPI() {
	const response = await fetch("/api/docs");
	const endpoints = await response.json();
	const docsAccordion = document.getElementById("docsAccordion");

	Object.keys(endpoints).forEach((category) => {
		let html = `<div class="accordion-item border-0 shadow-sm">
    <h2 class="accordion-header" id="${category}Heading">
        <button class="accordion-button collapsed bg-dark text-white border-0 rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#${category}Accordion" aria-expanded="false" aria-controls="${category}Accordion">
            <i class="bi bi-chevron-down me-2"></i><strong>${category.toUpperCase()}</strong>
        </button>
    </h2>
    <div id="${category}Accordion" class="accordion-collapse collapse" data-bs-parent="#docsAccordion">
        <div class="accordion-body bg-dark text-white border-0 p-4 rounded-3 shadow-sm">
            <div class="list-group">`;

		endpoints[category].forEach((endpoint) => {
			html += `
        <div class="list-group-item list-group-item-action my-3 rounded-3 bg-dark text-white shadow-lg">
            <h5 class="mb-3 text-primary"><strong>${endpoint.path}</strong></h5>
            <div class="d-flex justify-content-between align-items-center">
                <code class="bg-secondary text-light p-2 rounded">${
					endpoint.method
				} ${endpoint.path}</code>
                <button class="btn btn-outline-info btn-sm" data-bs-toggle="collapse" href="#form-${category}-${endpoint.path.replace(
					/\//g,
					"-",
				)}">Try It</button>
            </div>
            <div id="form-${category}-${endpoint.path.replace(
				/\//g,
				"-",
			)}" class="collapse mt-3">
                <form class="mt-2">
                    ${generateFormFields(category, endpoint.path)}
                    <button type="button" class="btn btn-success mt-2 w-100 rounded-3" onclick="tryAPI('${
						endpoint.method
					}', '${endpoint.path}', this, '${category}')">
                        <span class="spinner-border spinner-border-sm" style="display: none;"></span> Try API
                    </button>
                </form>
            </div>
        </div>`;
		});

		html += `</div></div></div></div>`;
		docsAccordion.innerHTML += html;
	});
}
// Fungsi untuk menghasilkan form input untuk endpoint yang membutuhkan parameter
function generateFormFields(category, path) {
	let fields = "";
	let requiredParams = getRequiredParams(category, path);

	requiredParams.forEach((param) => {
		fields += `<div class="mb-2">
                  <label class="form-label">${param}</label>
                  <input type="text" class="form-control" name="${param}" placeholder="Enter ${param}">
                </div>`;
	});

	return fields;
}

// Fungsi untuk mendapatkan parameter yang diperlukan untuk setiap endpoint
function getRequiredParams(category, path) {
	if (category.toLowerCase() === "search") return ["query"];
	if (category.toLowerCase() === "download") return ["url"];
	if (category.toLowerCase() === "information")
	  return ["tahun"];
	if (category.toLowerCase() === "tools")
	  return ["user"];
	if (category.toLowerCase() === "maker") {
		if (
			path.toLowerCase().includes("bratimage") ||
			path.toLowerCase().includes("bratvideo")
		)
			return ["text"];
		if (
			path.toLowerCase().includes("carbonv1") ||
			path.toLowerCase().includes("carbonv2")
		)
			return ["code"];
		if (path.toLowerCase().includes("emojimix"))
			return ["emoji1", "emoji2"];
		if (path.toLowerCase().includes("quotly"))
			return ["message", "username", "avatarurl"];
	}
	return [];
}

// Fungsi untuk mencoba API
async function tryAPI(method, path, button, category) {
	const form = button.parentElement;
	const inputs = form.querySelectorAll("input");
	let params = {};
	let missingParams = [];
	const spinner = button.querySelector(".spinner-border");

	// Tampilkan spinner dan nonaktifkan tombol sementara
	spinner.style.display = "inline-block";
	button.disabled = true;

	inputs.forEach((input) => {
		if (!input.value.trim()) {
			missingParams.push(input.name);
		} else {
			params[input.name] = input.value;
		}
	});

	if (missingParams.length > 0) {
		showErrorModal(
			`Error: Parameter ${missingParams.join(", ")} wajib diisi.`,
		);
		spinner.style.display = "none"; // Sembunyikan spinner
		button.disabled = false;
		return;
	}

	const url = path.startsWith("/api/") ? path : `/api${path}`;
	let options = { method };

	if (method.toUpperCase() === "POST") {
		options.headers = { "Content-Type": "application/json" };
		options.body = JSON.stringify(params);
	}

	try {
		const response = await fetch(
			url + (method === "GET" ? `?${new URLSearchParams(params)}` : ""),
			options,
		);
		const data = await response.json();
		showResponseModal(JSON.stringify(data, null, 2));
	} catch (error) {
		showErrorModal("Error: Gagal mendapatkan respons API.");
	} finally {
		spinner.style.display = "none"; // Sembunyikan spinner
		button.disabled = false;
	}
}

// Fungsi untuk menampilkan modal dengan error
function showErrorModal(message) {
	document.getElementById("apiResponse").textContent = message;
	new bootstrap.Modal(document.getElementById("apiResponseModal")).show();
}

// Fungsi untuk menampilkan modal dengan response
function showResponseModal(response) {
	document.getElementById("apiResponse").textContent = response;

	// Tambahkan tombol "Salin" dan "Download"
	document.getElementById("modalFooter").innerHTML = `
      <button class="btn btn-secondary" onclick="copyResponse()">Salin Response</button>
      <button class="btn btn-success" onclick="downloadResponse()">Download JSON</button>
    `;

	new bootstrap.Modal(document.getElementById("apiResponseModal")).show();
}

// Fungsi untuk menyalin response
function copyResponse() {
	const responseText = document.getElementById("apiResponse").textContent;
	navigator.clipboard
		.writeText(responseText)
		.then(() => alert("Response disalin!"));
}

// Fungsi untuk mendownload response
function downloadResponse() {
	const responseText = document.getElementById("apiResponse").textContent;
	const blob = new Blob([responseText], {
		type: "application/json",
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = "response.json";
	link.click();
}

document.body.style.fontFamily = '"IBM Plex Mono", monospace';

loadAPI();
