/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
$(window).on('load', () => {
  $("button[type='submit']").prop('disabled', false);
  // hide id="search-navbar" in nav bar
  $('#search-navbar').hide();
  $('#search-icon').hide();
});
