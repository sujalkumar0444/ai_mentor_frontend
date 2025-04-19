export const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  
  export const openRazorpay = async ({
    amount,
    projectId,
    freelancer,
  }: {
    amount: number;
    projectId: string;
    freelancer: any;
  }) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }
  
    const options = {
      key: "RAZORPAY_KEY_ID", // Replace with your actual Razorpay Key ID
      amount: amount * 100,
      currency: "INR",
      name: "AI Mentor",
      description: `Advance Payment for Project ${projectId}`,
      handler: function (response: any) {
        console.log("Payment success:", response);
        // You can update PB here with the transaction
      },
      prefill: {
        name: "Client",
        email: "client@example.com",
      },
      notes: {
        projectId,
      },
      theme: {
        color: "#4f46e5",
      },
    };
  
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };
  