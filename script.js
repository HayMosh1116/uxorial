/*==================================

        LUXORAL MAIN JAVASCRIPT

==================================*/

/*==================================

        SCROLL TO TOP

==================================*/

const scrollTop = document.querySelector(".scroll-top");

if (scrollTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 400) {

            scrollTop.classList.add("active");

        } else {

            scrollTop.classList.remove("active");

        }

    });

}

/*==================================

        REVEAL ANIMATION

==================================*/

const reveals = document.querySelectorAll(".reveal");

function revealElements() {

    const trigger = window.innerHeight * 0.85;

    reveals.forEach(element => {

        if (

            element.getBoundingClientRect().top < trigger

        ) {

            element.classList.add("show");

        }

    });

}

window.addEventListener("scroll", revealElements);

window.addEventListener("load", revealElements);

/*==================================

        PRODUCT PAGE

==================================*/

const productImage =

    document.getElementById("productImage");

const sizeButtons =

    document.querySelectorAll(".size");

const colorButtons =

    document.querySelectorAll(".color");

/*==================================

        SIZE SELECTION

==================================*/

sizeButtons.forEach(button => {

    button.addEventListener("click", () => {

        sizeButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

    });

});

/*==================================

        COLOR SELECTION

==================================*/

colorButtons.forEach(button => {

    button.addEventListener("click", () => {

        colorButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const image =

            button.getAttribute("data-image");

        if (productImage && image) {

            productImage.src = image;

        }

    });

});

/*==================================

        MOBILE MENU

==================================*/

const menuBtn =

    document.querySelector(".menu-btn");

const navLinks =

    document.querySelector(".nav-links");

const overlay =

    document.querySelector(".menu-overlay");

const menuIcon =

    document.getElementById("menuIcon");

if (menuBtn && navLinks) {

    function closeMenu() {

        navLinks.classList.remove("active");

        if (overlay) {

            overlay.classList.remove("active");

        }

        if (menuIcon) {

            menuIcon.className = "bx bx-menu";

        }

    }

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        if (overlay) {

            overlay.classList.toggle("active");

        }

        if (menuIcon) {

            if (

                navLinks.classList.contains("active")

            ) {

                menuIcon.className = "bx bx-x";

            } else {

                menuIcon.className = "bx bx-menu";

            }

        }

    });

    if (overlay) {

        overlay.addEventListener(

            "click",

            closeMenu

        );

    }

    document

        .querySelectorAll(".nav-links a")

        .forEach(link => {

            link.addEventListener(

                "click",

                closeMenu

            );

        });

}

/*==================================

        LUXORAL PRODUCT SEARCH

==================================*/

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    
    const productsContainer =
        
        document.querySelector(".products");
    
    const cards =
        
        document.querySelectorAll(".products .card");
    
    /* NO RESULTS MESSAGE */
    
    let noResults =
        
        document.getElementById("noResults");
    
    if (!noResults) {
        
        noResults = document.createElement("div");
        
        noResults.id = "noResults";
        
        noResults.innerHTML = `

            <i class='bx bx-search-alt'></i>

            <h2>No products found</h2>

            <p>

                We couldn't find anything matching your search.

            </p>

        `;
        
        noResults.style.display = "none";
        
        if (productsContainer) {
            
            productsContainer.appendChild(noResults);
            
        }
        
    }
    
    /* SEARCH */
    
    searchInput.addEventListener("input", () => {
        
        const value =
            
            searchInput.value
            
            .trim()
            
            .toLowerCase();
        
        let matches = 0;
        
        cards.forEach(card => {
            
            const text =
                
                card.textContent.toLowerCase();
            
            const matchesSearch =
                
                text.includes(value);
            
            if (matchesSearch) {
                
                card.style.display = "";
                
                matches++;
                
            } else {
                
                card.style.display = "none";
                
            }
            
        });
        
        /* NO RESULTS */
        
        if (value !== "" && matches === 0) {
            
            noResults.style.display = "block";
            
        } else {
            
            noResults.style.display = "none";
            
        }
        
    });
    
}

/*==================================

        TOAST NOTIFICATION

==================================*/

const toast =

    document.getElementById("toast");

function showToast(

    message = "Added to Cart"

) {

    if (!toast) return;

    const messageText =

        toast.querySelector("span");

    if (messageText) {

        messageText.textContent = message;

    }

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/*==================================

        LIVE CART BADGE

==================================*/

function updateCartBadge() {

    const cartBadge =

        document.getElementById("cartBadge");

    if (!cartBadge) return;

    const cart =

        JSON.parse(

            localStorage.getItem("cart")

        ) || [];

    let total = 0;

    cart.forEach(item => {

        total += Number(item.quantity) || 0;

    });

    cartBadge.textContent = total;

}

/* Update Cart Badge Immediately */

updateCartBadge();

/*==================================

        PAGE LOADER

==================================*/

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});

/*==================================

        PREMIUM BUTTON EFFECT

==================================*/

document

    .querySelectorAll(".btn")

    .forEach(button => {

        button.addEventListener(

            "mouseenter",

            () => {

                button.style.transform =

                    "translateY(-4px)";

            }

        );

        button.addEventListener(

            "mouseleave",

            () => {

                button.style.transform =

                    "translateY(0)";

            }

        );

    });

/*==================================

        CARD HOVER EFFECT

==================================*/

document

    .querySelectorAll(".card")

    .forEach(card => {

        card.addEventListener(

            "mousemove",

            e => {

                const rect =

                    card.getBoundingClientRect();

                const x =

                    e.clientX - rect.left;

                const y =

                    e.clientY - rect.top;

                card.style.setProperty(

                    "--x",

                    x + "px"

                );

                card.style.setProperty(

                    "--y",

                    y + "px"

                );

            }

        );

    });

/*==================================

        IMAGE FADE EFFECT

==================================*/

const images =

    document.querySelectorAll("img");

images.forEach(img => {

    img.addEventListener("load", () => {

        img.style.opacity = "1";

    });

});

/*==================================

        SCROLL HEADER

==================================*/

const navbar =

    document.querySelector(".navbar");

if (navbar) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 80) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

}

/*==================================

        SMOOTH PAGE TRANSITION

==================================*/

document

    .querySelectorAll("a")

    .forEach(link => {

        if (

            link.hostname ===

            window.location.hostname

        ) {

            link.addEventListener(

                "click",

                function () {

                    document.body.classList.add(

                        "fade-out"

                    );

                }

            );

        }

    });

/*==================================

        LUXORAL DARK MODE

==================================*/

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("luxoralTheme");

/*==================================

        APPLY SAVED THEME

==================================*/

if (savedTheme === "dark") {
    
    document.body.classList.add("dark-mode");
    
}

/*==================================

        UPDATE THEME ICON

==================================*/

function updateThemeIcon() {
    
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector("i");
    
    if (!icon) return;
    
    if (document.body.classList.contains("dark-mode")) {
        
        icon.className = "bx bx-sun";
        
    } else {
        
        icon.className = "bx bx-moon";
        
    }
    
}

/*==================================

        TOGGLE DARK MODE

==================================*/

if (themeToggle) {
    
    updateThemeIcon();
    
    themeToggle.addEventListener("click", () => {
        
        document.body.classList.toggle("dark-mode");
        
        /* SAVE THEME */
        
        if (document.body.classList.contains("dark-mode")) {
            
            localStorage.setItem(
                
                "luxoralTheme",
                
                "dark"
                
            );
            
        } else {
            
            localStorage.setItem(
                
                "luxoralTheme",
                
                "light"
                
            );
            
        }
        
        /* UPDATE ICON */
        
        updateThemeIcon();
        
    });
    
}
/*==================================

        END OF SCRIPT

==================================*/