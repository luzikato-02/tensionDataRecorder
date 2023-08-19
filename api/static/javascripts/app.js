$(document).ready(function() {
    $('#data-table').DataTable({
        ajax: {
            url: '/get_data',
            dataSrc: ''  // Data will be retrieved from this URL
        },
        columns: [
            { data: 'id' },
            { data: 'datetime' },
            { data: 'operator' },
            { data: 'machine_number'},
            {
                data: null,
                render: function(data, type, row) {
                    return '<button class="download-button" data-id="' + row.id + '">Download</button>';
                }
            }
            // Add more column configurations
        ]
    });
});

$(document).on('click', '.download-button', function() {
    var entryId = $(this).data('id');
    // Make an AJAX request to your Flask endpoint to initiate the download
    window.location.href = '/download/' + entryId;
});
