// from https://stackoverflow.com/questions/44018257/how-to-disable-bootstrap-data-spy-on-mobile-device-smaller-resolution
// on small screens, disable the scrollspy
function toggleSpyClass () {
    if ($(window).width() < 768) {
        $('body').removeAttr('data-spy');
     }
     else {
        $('body').attr('data-spy','scroll');
     }
  }