

let cart = [];

function addToCart(productName, productPrice) {
    // Check if the product is already in the cart
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1; // Increase quantity
    } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 }); // Add new product
    }
    updateCartDisplay();
}


function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = ''; // Clear current cart display

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty</p>';
        document.getElementById('cart-total').textContent = 'Total: Rs. 0'; // Set total to 0 if cart is empty
        return;
    }

    // Display cart items
    cart.forEach(item => {
        const itemElement = document.createElement('p');
        itemElement.textContent = `${item.name} - Rs.${item.price} x ${item.quantity}`;
        cartItemsDiv.appendChild(itemElement);
    });
    
    calculateTotal(); // Calculate total for non-empty cart
}

function increaseItem(productName,productPrice){
    //check product is there or no
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1; // Increase quantity
    } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 }); // Add new product
    }
    updateCartDisplay();

}
function decreaseItem(productName) {
    // Check if the product is in the cart
    const existingProductIndex = cart.findIndex(item => item.name === productName);

    if (existingProductIndex !== -1) {
        const existingProduct = cart[existingProductIndex];
        existingProduct.quantity -= 1; // Decrease quantity
        
        if (existingProduct.quantity === 0) {
            cart.splice(existingProductIndex, 1); // Remove item if quantity is zero
        }
    }

    updateCartDisplay();
}
function calculateTotal() {
    const total = cart.length > 0 
        ? cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
        : 0; // Set total to 0 if cart is empty
    document.getElementById('cart-total').textContent = `Total: Rs. ${total}`;
}


// Call `calculateTotal()` in `updateCartDisplay`



//for image hover
// JavaScript to handle image hover effects
document.querySelectorAll('.product-image img').forEach(img => {
    const originalSrc = img.src; // Store the original image source
    const hoverSrc = img.getAttribute('data-hover'); // Get the hover image source

    // Event listener for mouseover
    img.addEventListener('mouseover', () => {
        img.src = hoverSrc; // Change to hover image
    });

    // Event listener for mouseout
    img.addEventListener('mouseout', () => {
        img.src = originalSrc; // Revert back to original image
    });
});



