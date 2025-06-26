document.addEventListener("alpine:init", () => {
  Alpine.data("compliance", () => ({
    // State
    response: null,
    loading: false,
    error: null,
    question: "Can we describe our product as 'best in class' or 'most effective'?",
    showAnswer: false,
    questionInitialValue: "Can we describe our product as 'best in class' or 'most effective'?",
    hoveredStar: 0,
    rating: 0,
    username: "admin",
    password: "nitroV4nZ@9rPqL!2wX8sB",
    baseUrl: "https://n8n.nitro-test.co.uk/webhook/",
    loadingMessages: [
      "Processing...",
      "Analyzing your question...",
      "Checking similar cases...",
      "Analyzing compliance...",
    ],
    currentMessageIndex: 0,
    messageInterval: null,
    showPreparingMessage: false,

    // Computed properties
    credentials() {
      return btoa(`${this.username}:${this.password}`);
    },
    
    currentLoadingMessage() {
      return this.showPreparingMessage ? "Preparing your answer..." : this.loadingMessages[this.currentMessageIndex];
    },

    isDefaultQuestion() {
      return this.question === this.questionInitialValue;
    },

    // Methods
    generateSessionId() {
      return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    },

    startMessageRotation() {
      this.currentMessageIndex = 0;
      this.showPreparingMessage = false;
      this.messageInterval = setInterval(() => {
        if (!this.showPreparingMessage) {
          this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
        }
      }, 1000);
    },

    stopMessageRotation() {
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
        this.messageInterval = null;
      }
    },

    async submitQuestion() {
      if (!this.question.trim()) return;
      this.loading = true;
      this.error = null;
      this.startMessageRotation();

      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();

        const response = await fetch(`${this.baseUrl}compliance-nitro`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${this.credentials()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: this.question,
            sessionId: this.generateSessionId(),
            device_fingerprint: result.visitorId,
          }),
        });

        if (!response.ok) {
          const errorMsg = "Could not process your question. Please try rephrasing it to be more specific about ABPI Code compliance.";
          this.error = errorMsg;
          throw new Error(errorMsg);
        }

        this.response = await response.json();
        this.showPreparingMessage = true;

        setTimeout(() => {
          this.showAnswer = true;
          this.loading = false;
          this.stopMessageRotation();
        }, 2000);
      } catch (err) {
        this.error = err.message || "Failed to fetch data";
        this.loading = false;
        this.stopMessageRotation();
      }
    },

    reset() {
      this.response = null;
      this.showAnswer = false;
      this.error = null;
      this.rating = 0;
      this.question = this.questionInitialValue;
      this.stopMessageRotation();
    },

    async submitRating(stars) {
      if (this.rating) return; // Prevent multiple ratings
      this.rating = stars;

      try {
        const ratingResponse = await fetch(
          `${this.baseUrl}rate-compliance-nitro`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${this.credentials()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: this.response.answer.id,
              ratings: stars,
            }),
          }
        );

        if (!ratingResponse.ok) {
          throw new Error("Failed to submit rating");
        }

        await Swal.fire({
          title: "Thank you for your feedback!",
          text: `You rated this answer ${stars} stars`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#5CE1D3",
          customClass: {
            popup: "font-sans",
            title: "font-bold",
            confirmButton: "font-bold",
          },
          iconColor: '#5CE1D3'
        });
      } catch (error) {
        Swal.fire({
          title: "Rating not saved",
          text: "There was an error saving your rating. Please try again later.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#5CE1D3",
          customClass: {
            popup: "font-sans",
            title: "font-bold",
            confirmButton: "font-bold",
          },
          iconColor: '#5CE1D3'
        });
      }
    },

    onBlur() {
      if (this.question == '') {
        this.question = this.questionInitialValue;
      }
    },

    onFocus() {
      if (this.isDefaultQuestion()) {
        this.question = '';
      }
    },
  }));
}); 