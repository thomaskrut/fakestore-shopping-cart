function getProductsFromAPI(target) {

    const xhr1 = new XMLHttpRequest();
    const xhr2 = new XMLHttpRequest();

    xhr1.open('GET', 'https://mocki.io/v1/a99e6cf4-1e5a-4b0e-bc57-6c651f0f09cd');
    xhr2.open('GET', 'https://fakestoreapi.com/products');

    xhr1.send();
    xhr2.send();

    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4 && xhr1.status === 200) {
            xhr2.abort();
            console.log("connected to https://mocki.io/v1/a99e6cf4-1e5a-4b0e-bc57-6c651f0f09cd")
            populateProductTable(JSON.parse(xhr1.response), target);
        }
    }

    xhr2.onreadystatechange = () => {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            xhr1.abort()
            console.log("connected to https://fakestoreapi.com/products")
            populateProductTable(JSON.parse(xhr2.response), target);
        }
    }

}

const shoppingCart = {

    cart: new Map(),

    allProducts: [],

    numberOfItems: 0,

    addProduct: function (product) {
        if (this.cart.has(product.id)) {
            this.cart.set(product.id, this.cart.get(product.id) + 1);
        } else {
            this.cart.set(product.id, 1);
        }
        this.numberOfItems++;
        this.saveToLocalStorage();
    },

    alterProductCount: function (productId, count) {
        this.cart.set(productId, count)
        this.saveToLocalStorage();
    },

    removeProduct: function (productId) {
        this.cart.delete(productId);
        this.saveToLocalStorage();
    },

    removeAllProducts: function () {
        if (confirm("Delete all items from order?")) {
            this.cart.clear();
            this.saveToLocalStorage();
            this.updateSum();
        }

    },

    sendOrder: function () {
        this.cart.clear();
        this.saveToLocalStorage();
        this.updateSum();
    },

    updateSum: function (products) {

        if (this.cart.size == 0) {
            window.location.href = "index.html";
            return;
        }
        let sum = 0;
        this.cart.forEach((value, key) => {
            const currentProductPrice = products.filter(p => { return p.id == key; })[0].price;
            sum = sum + currentProductPrice * value;
        })
        document.querySelector('#sumOfAll').textContent = 'Subtotal ' + sum.toFixed(2);

    },

    saveToLocalStorage: function () {

        localStorage.setItem('cart', JSON.stringify(Array.from(this.cart)));
        this.readFromLocalStorage();

    },

    updateCartIcon: function () {
        document.querySelector('#products-in-cart').innerHTML = this.numberOfItems;
        document.querySelector('#products-in-cart').classList.add('expand');
        setTimeout(() => document.querySelector('#products-in-cart').classList.remove('expand'), 200);
    },

    readFromLocalStorage: function () {
        this.numberOfItems = 0;
        if (localStorage.getItem('cart') !== null) {
            const cartArray = JSON.parse(localStorage.getItem('cart'));
            cartArray.forEach(entry => {
                this.cart.set(entry[0], entry[1]);
                this.numberOfItems += entry[1];
            });
        }
        this.updateCartIcon();
    }


};



const saveInLocalStorage = (name, object) => localStorage.setItem(name, JSON.stringify(object));
const loadFromLocalStorage = (name) => JSON.parse(localStorage.getItem(name));

function populateCustomerDetailsTable(customerDetails, customerDetailsDiv) {
    Object.keys(customerDetails).forEach((key) => {
        const row = document.querySelector('.customer-details-table-row').cloneNode(true)

        row.querySelector('.customer-details-table-property-name').innerHTML = (key.charAt(0).toUpperCase() + key.slice(1) + ':').replace(/-/g, " ")
        row.querySelector('.customer-details-table-property-value').innerHTML = customerDetails[key]

        row.classList.remove('d-none')
        customerDetailsDiv.querySelector('.customer-details-table').appendChild(row)
    });
}

function buyProduct(product) {
    shoppingCart.addProduct(product);
}



function populateProductTable(products, productTable, showBuyButton = true) {

    shoppingCart.allProducts = products;

    products.forEach(p => {


        const row = document.querySelector('.product-col').cloneNode(true)
        const modal = document.querySelector('.modal').cloneNode(true)
        modal.id = 'modal' + p.id;
        modal.querySelector('.btn-close').addEventListener('click', () => {
            $('#modal' + p.id).modal('toggle');
        });

        [row, modal].forEach(e => {
            e.querySelector('.product-title').innerHTML = p.title;
            e.querySelector('.description').innerHTML = p.description;
            e.querySelector('.product-table-image').src = p.image;
            e.querySelector('.product-table-image').alt = 'Image of ' + p.title;
            e.querySelector('.rating-upper').style.width = p.rating.rate / 5 * 100 + "%"
            e.querySelector('.rating-text').innerHTML = p.rating.rate + " stars (" + p.rating.count + " votes)"
            e.querySelector('.price').innerHTML = "$" + p.price.toFixed(0)
            e.querySelector('.decimals').innerHTML = (((p.price - Math.floor(p.price)) * 100) + "0").substring(0, 2);
        })

        row.querySelector('.card-body').addEventListener('click', () => $('#modal' + p.id).modal('toggle'));
        row.querySelector('.product-table-image').addEventListener('click', () => $('#modal' + p.id).modal('toggle'));

        row.querySelector('.category').innerHTML = p.category

        if (showBuyButton) {
            [row, modal].forEach(e => e.querySelector('.add-to-cart-button').addEventListener("mousedown", () => shoppingCart.addProduct(p)))
        } else {
            [row, modal].forEach(e => e.querySelector('.add-to-cart-button').classList.add('d-none'));
        }

        row.classList.remove('d-none')
        productTable.appendChild(row)
        productTable.appendChild(modal);

    });

}

function viewShoppingCart(products = shoppingCart.allProducts) {

    document.querySelector('#customer-details').style.display = 'none';
    const productsTable = document.querySelector('#cart-table');
    productsTable.innerHTML = "";

    shoppingCart.cart.forEach((value, key) => {
        const count = value;
        const currentProduct = products.filter(p => { return p.id == key; })[0];
        const newTableRow = document.createElement("tr");
        newTableRow.id = currentProduct.id;

        const imageCell = document.createElement("td");
        const productImage = document.createElement("img");
        productImage.src = currentProduct.image;
        productImage.className = "cart-product";
        imageCell.appendChild(productImage);
        newTableRow.appendChild(imageCell);

        const countCell = document.createElement("td");
        const countField = document.createElement("input");
        countField.className = 'count';
        countField.min = 0;
        countField.type = 'number';
        countField.value = count;
        countField.addEventListener("input", () => {
            shoppingCart.alterProductCount(currentProduct.id, Number(countField.value));
            document.querySelector('#sum' + currentProduct.id).textContent = (currentProduct.price * countField.value).toFixed(2);
            shoppingCart.updateSum(products);
        });
        countCell.appendChild(countField);
        newTableRow.appendChild(countCell);

        const titleCell = document.createElement("td");
        titleCell.style.width = '100%';
        titleCell.textContent = currentProduct.title;
        newTableRow.appendChild(titleCell);

        const productSum = document.createElement("td");
        productSum.id = 'sum' + currentProduct.id;
        productSum.textContent = (currentProduct.price * count).toFixed(2);
        productSum.style.textAlign = 'right';
        newTableRow.appendChild(productSum);

        const deleteCell = document.createElement("td");
        const deleteImage = document.createElement("img");
        deleteImage.src = "x.jpg";
        deleteImage.className = 'delete';

        deleteCell.appendChild(deleteImage);
        newTableRow.appendChild(deleteCell);

        productsTable.appendChild(newTableRow);
        deleteImage.addEventListener('click', () => {
            productsTable.removeChild(newTableRow);
            shoppingCart.removeProduct(currentProduct.id);
            shoppingCart.updateSum(products);
        });
    })


    const bottomRow = document.createElement("tr");
    bottomRow.className = 'bottom-row';

    bottomRow.style.borderTopWidth = '1px';

    const removeAllCell = document.createElement("td");
    const checkoutCell = document.createElement("td");

    checkoutCell.colSpan = 2;
    bottomRow.appendChild(checkoutCell);
    bottomRow.appendChild(removeAllCell);


    const checkOutButton = document.createElement("button");
    checkOutButton.addEventListener("click", () => checkOut());
    checkOutButton.className = "btn btn-success";
    checkOutButton.textContent = "Checkout";
    checkoutCell.appendChild(checkOutButton);

    const removeAllButton = document.createElement("button");
    removeAllButton.addEventListener("click", () => shoppingCart.removeAllProducts());
    removeAllButton.className = "btn btn-warning";
    removeAllButton.textContent = "Remove all items";
    removeAllCell.appendChild(removeAllButton);

    const sumCell = document.createElement("td");
    sumCell.id = 'sumOfAll';
    sumCell.style.textAlign = 'right';
    sumCell.style.fontWeight = 'bold';

    sumCell.textContent = 'summa';

    bottomRow.appendChild(sumCell);

    productsTable.appendChild(bottomRow);
    shoppingCart.updateSum(products);


}

function checkOut() {
    document.querySelector('#customer-details').style.display = 'block';
}

(function initForms() {
    const forms = document.querySelectorAll('.needs-validation');
    const markInputValidity = (input, isValid) => { input.classList.toggle('is-valid', isValid); input.classList.toggle('is-invalid', !isValid); };
    const stopFormSubmissionIfInvalid = (form, event) => (!form.checkValidity()) ? event.preventDefault() : shoppingCart.sendOrder();

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', (event) => { form.classList.add('was-validated'); stopFormSubmissionIfInvalid(form, event); });
        form.addEventListener('change', (event) => markInputValidity(event.target, event.target.checkValidity()));
    })
})();

(function initTables() {

    shoppingCart.readFromLocalStorage();

    document.querySelector('.cart').addEventListener('click', () => {
        viewShoppingCart();
        $('#cart-viewer').modal('toggle');
    });

    document.querySelector('.cart-close').addEventListener('click', () => {
        $('#cart-viewer').modal('toggle');
    });

    const divs = document.querySelectorAll('div')

    divs.forEach((div) => {
        switch (div.id) {
            case 'product-table': getProductsFromAPI(div); break;
            case 'products-in-cart-table': populateProductTable([loadFromLocalStorage('product')], div, false); break;
            case 'customer-details': populateCustomerDetailsTable(loadFromLocalStorage('customer-details'), div); break;
        }
    })
})();