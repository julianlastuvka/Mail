

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send email event listener
  document.querySelector("#compose-form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});


function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result.message);

      if(result.message === 'Email sent successfully.'){
        load_mailbox('sent');
      }
      
  });
  
  return false;
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function reply_email(email){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = email.sender;

  if(email.subject.slice(0,3) !== 'Re:'){
      var subject = `Re: ${email.subject}`;
  } else {
    var subject = email.subject;
  }

  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: '${email.body}'\n\n `;

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = "";


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  load_emails(mailbox);
}

function load_emails(mailbox){

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      emails.forEach( email => {

        const email_container = document.createElement('div');
        email_container.classList.add("email");

        email_container.onclick = () =>{
          load_email(email.id, mailbox);
        }
        

        if(email.read === false){
          email_container.style.backgroundColor = "white"; 
        } else {
          email_container.style.background = "gray"; 
          email_container.style.color = "white"; 
        }

        const sender = document.createElement('div');
        const subject = document.createElement('div');
        const date = document.createElement('div');

        sender.innerHTML = `<span style="font-weight:bold">${email.sender}</span> `;
        subject.innerHTML = `${email.subject}`;
        date.innerHTML = `${email.timestamp}`

        document.querySelector('#emails-view').appendChild(email_container);

        email_container.appendChild(sender);
        email_container.appendChild(subject);
        email_container.appendChild(date);

      });

  });

}


function load_email(email_id, mailbox){

  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#email-view').innerHTML = "";

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    //mark as readed

    if(email.read === false){
      mark_as_read(email.id);
    }

    console.log(email.body);
    
    const email_container = document.createElement('div');

    const sender = document.createElement('div');
    const recipients = document.createElement('div');
    const subject = document.createElement('div');
    const date = document.createElement('div');
    const body = document.createElement('div');
    
    const reply_btn = document.createElement('button');

    reply_btn.innerHTML = 'Reply';

    reply_btn.onclick = () =>{
      reply_email(email);
    }


    sender.innerHTML = `<span style="font-weight:bold">Sender</span>: ${email.sender}`;
    recipients.innerHTML = `<span style="font-weight:bold">Recipients</span>: ${email.recipients}`;
    subject.innerHTML = `<span style="font-weight:bold">Subject</span>: ${email.subject}`;
    date.innerHTML = `<span style="font-weight:bold">Timestamp</span>: ${email.timestamp}`;
    body.innerHTML = `${email.body}`;

    document.querySelector('#email-view').appendChild(email_container);

    email_container.appendChild(sender);
    email_container.appendChild(recipients);
    email_container.appendChild(subject);
    email_container.appendChild(date);
    
    email_container.appendChild(reply_btn);
    
    if(mailbox !== 'sent'){
      const archive_btn = document.createElement('button');

      if(email.archived === true){
        archive_btn.innerHTML = 'Unarchive';
        archive_btn.onclick = () => {
          unarchive_email(email_id);
        }
      } else{
        archive_btn.innerHTML = 'Archive';
        archive_btn.onclick = () =>{
          archive_email(email_id);
        }
      }
      email_container.appendChild(archive_btn);
    }

    const hr = document.createElement('hr');

    email_container.appendChild(hr);
    email_container.appendChild(body);

});
}


function mark_as_read(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

}

function archive_email(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  }).then( () =>{
    load_mailbox('inbox');
  });
  
}


function unarchive_email(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  }).then( () =>{
    load_mailbox('inbox');
  });
  
}

