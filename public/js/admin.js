const deleteEvent = btn => {
  const evenId = btn.parentNode.querySelector('[name=eventId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const eventElement = btn.closest('article');

  fetch('/admin/event/' + evenId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      eventElement.parentNode.removeChild(eventElement);
    })
    .catch(err => {
      console.log(err);
    });
};
