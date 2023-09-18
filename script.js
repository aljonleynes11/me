


function data() {
    return {
        name: "Aljon Leynes",
        role: "Full Stack Mobile Developer",
        specialization: [
            "Flutter",
            "Laravel"
        ],
        projects: [
            {
                "name": "aiode",
                "path": "/assets/images/projects/aiode.png",
            },
            {
                "name": "cloudmd",
                "path": "/assets/images/projects/cloudmdlogo.png",
            },
            {
                "name": "swamiji",
                "path": "/assets/images/projects/swamiji.png",
            },
            {
                "name": "wheelcheck",
                "path": "/assets/images/projects/wheelcheck.png",
            },
            {
                "name": "sigma",
                "path": "/assets/images/projects/sigma.png",
            },
          
        ],
        wave: "👋",

        clickEm() {
            window.location.href = "mailto:aljonleynes11@gmail.com?subject=Hi,%20Aljon&body=Do%20you%20have%20a%20minute";
        }
    }
}