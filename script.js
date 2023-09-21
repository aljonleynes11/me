

function data() {
    return {
        name: "Aljon Leynes",
        role: "Full Stack Mobile Developer",
        state: "about",
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
        techStack: [

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
        socials: [
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
        },
        setState(string) {
            this.state = 'loading';
            setTimeout(() => {
                this.goState(string);
            }, 500);
        },
        goState(string) {
            if (this.state != string) {
                this.state = string;
            }
        }
    }
}
