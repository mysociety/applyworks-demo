import { initAll } from './govuk-frontend.min.js';

var stateful = new window.Stateful();

// Initialise GOV.UK Frontend after Stateful has restored checked radios and
// checkboxes, so their conditionally revealed content is shown on page load.
initAll();

var scenarios = {
    "public": {
        "user-name": "Sarah Philips",
        "user-phone": "07700 900457",
        "user-email": "sarah.phillips@example.com",
        "user-address-line-1": "72 Guild Street",
        "user-address-line-2": "",
        "user-address-town": "London",
        "user-address-county": "",
        "user-postcode": "SE23 6FH"
    },
    "street-trading": {
        "user-name": "Sarah Philips",
        "user-phone": "07700 900457",
        "user-email": "sarah.phillips@example.com",
        "applicant-address-line-1": "72 Guild Street",
        "applicant-address-line-2": "",
        "applicant-address-town": "London",
        "applicant-address-county": "",
        "applicant-postcode": "SE23 6FH",
        "applicant-dob-day": "14",
        "applicant-dob-month": "6",
        "applicant-dob-year": "1984",
        "applicant-photo-id-file": "passport.jpg",
        "applicant-proof-of-address-file": "council-tax-bill-2026.pdf",
        "applicant-ni-number": "QQ 12 34 56 C",
        "current-consent-details": "ST/2023/0187, Pitch 14 Rye Lane, April 2023 to March 2024",
        "trading-site-type": "fixed",
        "site-address-line-1": "Pitch 14, Rye Lane Market",
        "site-address-line-2": "Rye Lane",
        "site-address-town": "London",
        "site-address-county": "",
        "site-postcode": "SE15 4ST",
        "stall-description": "Gazebo with two folding tables, and a branded banner along the front edge. Hot food is prepared on a gas griddle at the back of the stall.",
        "stall-dimensions": "3m x 3m",
        "stall-photos-file": "stall-front.jpg, stall-signage.jpg",
        "waste-provision": "All food waste and packaging is bagged and taken away at the end of each day. Waste water is collected in a sealed container and disposed of at our commercial kitchen.",
        "toilet-arrangements": "Arrangement with The Rye café, 20 metres from the pitch, for use of their customer toilets.",
        "licence-period": "annual",
        "hours-tuesday-start": "11am",
        "hours-tuesday-end": "3pm",
        "hours-wednesday-start": "11am",
        "hours-wednesday-end": "3pm",
        "hours-thursday-start": "11am",
        "hours-thursday-end": "3pm",
        "hours-friday-start": "11am",
        "hours-friday-end": "8pm",
        "hours-saturday-start": "10am",
        "hours-saturday-end": "8pm",
        "article-food-h": "Hot or cold prepared/cooked food",
        "article-food-i": "Hot or cold non-alcoholic beverages, smoothies, freshly pressed fruit juices"
    },
    "staff": {
        "is-staff": true,
        "signed-in": true
    },
};

$('[data-start-scenario]').on('click', function(e){
    e.preventDefault();
    var url = $(this).attr('href');
    var scenario = $(this).attr('data-start-scenario');
    stateful.clearState();
    $.each(scenarios[scenario], function(key, val){
        stateful.updateState(key, val);
    });
    stateful.applyState();
    window.location.href = url;
});

$('.js-clear-scenario').on('click', function(e){
    e.preventDefault();
    stateful.clearState();
    window.location.reload();
});

$('.js-scenario-data').each(function(){
    var state = stateful.getState();
    var keys = Object.keys(state).sort();
    var $tableBody = $('.govuk-table__body', this);

    $tableBody.html('');
    $.each(keys, function(i, key){
        $tableBody.append(
            '<tr class="govuk-table__row">' +
            '<td class="govuk-table__cell">' + key + '</td>' +
            '<td class="govuk-table__cell">' + state[key] + '</td>' +
            '</tr>'
        );
    });
});

var dateFormat = function dateFormat(y, m, d) {
    function ordinal(d){
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
        }
    }

    function month(m) {
        return [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ][m-1];
    }

    return '' + d + ordinal(d) + ' ' + month(m) + ' ' + y;
}

// Add the id prefix of any new date inputs here, eg: 'start-date' will
// fill `.js-start-date` elements from start-date-{year,month,day} state.
$.each(['applicant-dob'], function(i, id){
    $('.js-' + id).each(function(){
        var y = stateful.getState(id + '-year');
        var m = stateful.getState(id + '-month');
        var d = stateful.getState(id + '-day');
        if (y && m && d) {
            $(this).text(dateFormat(y, m, d));
        }
    });
});

$('.govuk-date-input.st8ify').each(function(){
    $('input', this).each(function(){
        var key = $(this).attr('id');
        var state = stateful.getState(key);
        $(this).val(state);
        $(this).on('change', function(){
            stateful.updateState(key, $(this).val());
        });
    });
});

if (stateful.getState('signed-in')) {
    $('.js-signed-in-navigation').removeClass('hidden');
}

$('.js-sign-in').on('click', function(){
    stateful.updateState('signed-in', 'true');
});

$('.govuk-service-navigation a[href*="/sign-in"]').on('click', function(){
    stateful.updateState('signed-in'); // removes the state
});

// Stateful can’t restore file inputs, so just store the selected file names.
$('input[type="file"][data-file-key]').on('change', function(){
    var names = $.map(this.files, function(file){ return file.name; });
    stateful.updateState($(this).attr('data-file-key'), names.length ? names.join(', ') : undefined);
});

// Search box that filters groups of checkboxes by their labels (or by the
// group’s legend), eg: data-filter-target=".js-article-group"
$('[data-filter-target]').each(function(){
    var $input = $(this);
    var $groups = $($input.attr('data-filter-target'));
    var $noResults = $('.js-filter-no-results');

    $input.on('input', function(){
        var query = $input.val().trim().toLowerCase();
        var anyVisible = false;

        $groups.each(function(){
            var $group = $(this);
            var groupMatches = $group.find('legend').text().toLowerCase().indexOf(query) > -1;
            var groupVisible = false;

            $group.find('.govuk-checkboxes__item').each(function(){
                var $item = $(this);
                var matches = groupMatches || $item.find('label').text().toLowerCase().indexOf(query) > -1;
                $item.add($item.next('.govuk-checkboxes__conditional')).toggleClass('filter-hidden', !matches);
                groupVisible = groupVisible || matches;
            });

            $group.toggleClass('filter-hidden', !groupVisible);
            anyVisible = anyVisible || groupVisible;
        });

        $noResults.prop('hidden', anyVisible);
    });
});

// Hide groups (eg: article categories on the check answers page) where
// Stateful has hidden every item.
$('.js-hide-if-empty').each(function(){
    var $items = $(this).find('[data-st8-show-if-set]');
    $(this).prop('hidden', $items.filter('[aria-hidden="false"]').length === 0);
});
