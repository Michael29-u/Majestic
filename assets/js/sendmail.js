function sendMail() {
   let params = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
  
   } 

    emailjs.send("service_ogljbl6","template_9aukr5p",params)
    
  } 