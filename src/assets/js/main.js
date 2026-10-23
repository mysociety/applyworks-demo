import { initAll } from './govuk-frontend.min.js';

initAll();

var stateful = new window.Stateful();

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
$.each([], function(i, id){
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
