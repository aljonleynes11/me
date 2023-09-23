

function data() {
    return {
        name: "Aljon Leynes",
        role: "Full Stack Mobile Developer",
        state: "about",
        specialization: [
            "Flutter",
            "Laravel"
        ],
        mobileProjects: [
            {
                "name": "aiode",
                "path": "assets/images/projects/aiode.png",
            },
            {
                "name": "cloudmd",
                "path": "assets/images/projects/cloudmdlogo.png",
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
        ],
        webProjects: [
            {
                "name": "sigma",
                "path": "assets/images/projects/sigma.png",
            },
            {
                "name": "iamcare",
                "path": "assets/images/projects/iamcare.png",
            },
            {
                "name": "wheelcheck",
                "path": "assets/images/projects/wheelcheck.png",
                "class": "w-120",
            },
        ],
        techStack: [

            {
                "name": "Flutter",
                "path": "assets/images/tech_stack/flutter.png",
                "delay": '1s',
            },
            {
                "name": "Laravel",
                "path": "assets/images/tech_stack/laravel.png",
                "delay": '1s',
            },
            {
                "name": "VueJS",
                "path": "assets/images/tech_stack/vuejs.png",
                "delay": '1s',
            },
            {
                "name": "Firebase",
                "path": "assets/images/tech_stack/firebase.png",
                "delay": '1s',
            },
            {
                "name": "Linux",
                "path": "assets/images/tech_stack/linux.jpg",
                "delay": '1s',
            },
            {
                "name": "AWS",
                "path": "assets/images/tech_stack/aws.png",
                "delay": '1s',
            },
            {
                "name": "php",
                "path": "assets/images/tech_stack/php.png",
                "delay": '1s',
            },
            {
                "name": "livewire",
                "path": "assets/images/tech_stack/livewire.png",
                "delay": '1s',
            },
            {
                "name": "js",
                "path": "assets/images/tech_stack/js.png",
                "delay": '2s',
            },
            {
                "name": "html",
                "path": "assets/images/tech_stack/html5.png",
                "delay": '3s',
            },
            {
                "name": "css",
                "path": "assets/images/tech_stack/css.webp",
                "delay": '4s',
            },
            {
                "name": "bootstrap",
                "path": "assets/images/tech_stack/bootstrap.jpg",
                "delay": '5s',
            },
            {
                "name": "tailwind",
                "path": "assets/images/tech_stack/tailwind.jpg",
                "delay": '6s',
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
        setState(string, el) {
            this.goState(string);
           
        },
        goState(string) {
            if (this.state != string) {
                this.state = string;
            }
        }
    }
}
