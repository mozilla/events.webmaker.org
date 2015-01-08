describe('Webmaker Events – Home', function() {
  var upcomingEvents = element.all(by.css('.listing-home li'));

  beforeEach(function() {
    browser.get('http://localhost:1981/');
  });

  it('should feature some events', function() {
    expect(upcomingEvents.count()).toBeGreaterThan(0);
  });

  it('should have 10 or less featured events', function() {
    expect(upcomingEvents.count()).toBeLessThan(11);
  });

});

describe('Webmaker Events – Upcoming Events', function() {
  var searchBox = element(by.css('[test-id=search-box]'));
  var submitSearchButton = element(by.css('[test-id=submit-search-btn]'));
  var clearSearchButton = element(by.css('[test-id=clear-btn]'));
  var searchResultCount = element(by.binding('searchResultCount'));

  beforeEach(function() {
    browser.get('http://localhost:1981/events');
  });

  it('should empty searchbox when clear button is clicked', function () {
    searchBox.sendKeys('test');
    submitSearchButton.click();
    clearSearchButton.click();
    expect(searchBox.getText()).toEqual('');
  });

});
