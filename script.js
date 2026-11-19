const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productQuantity = document.getElementById("productQuantity");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const productsDisplayContainer = document.getElementById("productsDisplayContainer");
const productsCount = document.getElementById("productsCount");
const totalValue = document.getElementById("totalValue");

let products = [];
let editIndex = null;
let messageTimeout = null;

const savedProducts = localStorage.getItem("allProducts");
if (savedProducts !== null) {
    try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
            products = parsed;
        }
    } catch (error) {
        products = [];
    }
}

function showMessage(text, type, duration = 3000) {
    clearTimeout(messageTimeout);
    message.textContent = text;
    message.className = type;

    if (duration > 0) {
        messageTimeout = setTimeout(() => {
            message.textContent = "";
            message.className = "";
        }, duration);
    }
}

function saveProducts() {
    localStorage.setItem("allProducts", JSON.stringify(products));
}

function updateSummary() {
    productsCount.textContent = products.length;

    const total = products.reduce((sum, item) => {
        return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    totalValue.textContent = `$${total.toFixed(2)}`;
}

function resetForm() {
    productName.value = "";
    productPrice.value = "";
    productQuantity.value = "";
    editIndex = null;
    saveBtn.textContent = "Save Product";
    cancelEditBtn.classList.add("hidden");
}

function createProductCard(product, originalIndex) {
    const card = document.createElement("div");
    card.className = "product-card";

    const info = document.createElement("div");
    info.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const priceLine = document.createElement("p");
    const priceLabel = document.createElement("span");
    priceLabel.textContent = "Price:";
    priceLine.append(priceLabel,  `$${Number(product.price).toFixed(2)}`);

    const quantityLine = document.createElement("p");
    const quantityLabel = document.createElement("span");
    quantityLabel.textContent = "Quantity:";
    quantityLine.append(quantityLabel,  `${product.quantity}`);

    info.append(title, priceLine, quantityLine);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.dataset.action = "edit";
    editBtn.dataset.index = originalIndex;
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.index = originalIndex;
    deleteBtn.textContent = "Delete";

    actions.append(editBtn, deleteBtn);
    card.append(info, actions);

    return card;
}

function displayProducts() {
    const query = searchInput.value.trim().toLowerCase();
    productsDisplayContainer.innerHTML = "";

    const filteredItems = products
        .map((product, index) => ({ product, index }))
        .filter(({ product }) => product.name.toLowerCase().includes(query));

    if (filteredItems.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.className = "no-products";
        emptyText.textContent = query
            ? "No matching products found."
            : "No products added yet.";
        productsDisplayContainer.appendChild(emptyText);
        return;
    }
    filteredItems.forEach(({ product, index }) => {
            const card = createProductCard(product, index);
            productsDisplayContainer.appendChild(card);
        });
}

saveBtn.addEventListener("click", () => {
    const nameValue = productName.value.trim();
    const priceValue = Number(productPrice.value);
    const quantityValue = Number(productQuantity.value);

    if (
        nameValue === "" ||
        productPrice.value.trim() === "" ||
        productQuantity.value.trim() === ""
    ) {
        showMessage("Please enter all product details!", "error-msg");
        return;
    }

    if (Number.isNaN(priceValue) || priceValue <= 0 || Number.isNaN(quantityValue) || quantityValue <= 0) {
        showMessage("Price and quantity must be greater than 0!", "error-msg");
        return;
    }

    const product = {
        name: nameValue,
        price: priceValue,
        quantity: quantityValue
    };

    if (editIndex === null) {
        products.push(product);
        showMessage("Product saved successfully!", "success-msg");
    } else {
        products[editIndex] = product;
        showMessage("Product updated successfully!", "success-msg");
    }

    saveProducts();
    displayProducts();
    updateSummary();
    resetForm();
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
    showMessage("Edit cancelled.", "info-msg");
});

searchInput.addEventListener("input", () => {
    displayProducts();
});

productsDisplayContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const index = Number(button.dataset.index);

    if (Number.isNaN(index) || !products[index]) return;

    if (action === "edit") {
        startEdit(index);
    } else if (action === "delete") {
        deleteProduct(index);
    }
});

function startEdit(index) {
    const targetProduct = products[index];
    productName.value = targetProduct.name;
    productPrice.value = targetProduct.price;
    productQuantity.value = targetProduct.quantity;

    editIndex = index;
    saveBtn.textContent = "Update Product";
    cancelEditBtn.classList.remove("hidden");
    showMessage("Editing product details...", "info-msg", 0);
    productName.focus();
}

function deleteProduct(index) {
    if (editIndex === index) {
        resetForm();
    } else if (editIndex !== null && index < editIndex) {
        editIndex -= 1;
    }

    products.splice(index, 1);
    saveProducts();
    displayProducts();
    updateSummary();
    showMessage("Product deleted successfully!", "success-msg");
}

displayProducts();
updateSummary();