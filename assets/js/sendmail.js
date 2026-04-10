function sendMail() {
   let params = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
   
   } 

   const config = window.API_CONFIG || {};
   emailjs.send(config.emailjsServiceId, config.emailjsTemplateId, params)
     
   }