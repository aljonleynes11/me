
const element1 = document.querySelector('.section1');
const element2 = document.querySelector('.section2');
const element3 = document.querySelector('.section3');
const els = [
    element1, element2, element3,
]

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const height = (window.innerHeight || document.documentElement.clientHeight);
    const width = (window.innerWidth || document.documentElement.clientWidth);
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= height &&
        rect.right <= width
    );
}

function checkElementVisibility() {
    els.forEach((el) => {
        if (isElementInViewport(el)) {
            el.classList.add('visible'); // Add a class to trigger the fade-in animation
        } else {
            el.classList.remove('visible'); // Remove the class to hide the element
        }
    });
}

checkElementVisibility();

const scrollContainer = document.querySelector('.scroll-snap-container'); // Replace with the appropriate scroll container selector
scrollContainer.addEventListener('scroll', checkElementVisibility);

element1.addEventListener('mouseover', () => {
    console.log('Mouse over .section1');
});

function data() {
    return {
        name: "Aljon Leynes",
        role: "Full Stack Mobile Developer",
        wave: "",
        specialization: [
            "Flutter",
            "Laravel"
        ],
        projects: [
            {
                "name": "aiode",
                "path": "assets/images/projects/aiode.png",
            },
            {
                "name": "cloudmd",
                "path": "assets/images/projects/cloudmdlogo.png",
            },
            {
                "name": "sigma",
                "path": "assets/images/projects/sigma.png",
            },
            {
                "name": "iamcare",
                "path": "assets/images/projects/iamcare.png",
            },
            // {
            //     "name": "Bukka Services",
            //     "path": "assets/images/projects/bukkaservices.jpg",
            // },
            // {
            //     "name": "Bukka Waste",
            //     "path": "assets/images/projects/bukkawaste.png",
            // },
            {
                "name": "phreviewer",
                "path": "assets/images/projects/phreviewer.png",
            },
            {
                "name": "iwallet",
                "path": "assets/images/projects/iwallet.png",
            },
            {
                "name": "swamiji",
                "path": "assets/images/projects/swamiji.png",
            },
            {
                "name": "wheelcheck",
                "path": "assets/images/projects/wheelcheck.png",
            },
        ],
        "techStack": [

            {
                "name": "Flutter",
                "path": "assets/images/tech_stack/flutter.png",
            },
            {
                "name": "Laravel",
                "path": "assets/images/tech_stack/laravel.png",
            },
            {
                "name": "VueJS",
                "path": "assets/images/tech_stack/vuejs.png",
            },
            {
                "name": "Firebase",
                "path": "assets/images/tech_stack/firebase.png",
            },
            {
                "name": "Linux",
                "path": "assets/images/tech_stack/linux.jpg",
            },
            {
                "name": "AWS",
                "path": "assets/images/tech_stack/aws.png",
            },
            {
                "name": "php",
                "path": "assets/images/tech_stack/php.png",
            },
            {
                "name": "livewire",
                "path": "assets/images/tech_stack/livewire.png",
            },
            {
                "name": "js",
                "path": "assets/images/tech_stack/js.png",
            },
            {
                "name": "html",
                "path": "assets/images/tech_stack/html5.png",
            },
            {
                "name": "css",
                "path": "assets/images/tech_stack/css.webp",
            },
            {
                "name": "bootstrap",
                "path": "assets/images/tech_stack/bootstrap.jpg",
            },
            {
                "name": "tailwind",
                "path": "assets/images/tech_stack/tailwind.jpg",
            },
        ],
        "socials": [
            {
                "name": "linkedin",
                "path": "assets/images/socials/linkedin.png",
            },
            {
                "name": "github",
                "path": "assets/images/socials/github.jpg",
            },
            {
                "name": "facebook",
                "path": "assets/images/socials/facebook.png",
            },

        ],

        clickEm() {
            window.location.href = "mailto:aljonleynes11@gmail.com?subject=Hi,%20Aljon&body=Let's%20connect.";
        }
    }
}