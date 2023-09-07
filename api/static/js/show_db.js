$(document).ready(function () {
  $("#tw-data-table").DataTable({
    ajax: {
      url: "/get_tw_data",
      dataSrc: "", // Data will be retrieved from this URL
    },
    columns: [
      { data: "datetime" },
      { data: "operator" },
      { data: "item_number" },
      { data: "machine_number" },
      { data: "rpm" },
      { data: "tpm" },
      { data: "stdTen" },
      { data: "devTen" },
      {
        data: null,
        render: function (data, type, row) {
          return (
            '<button class="tw-download-button" data-id="' +
            row.id +
            '">Download</button>'
          );
        },
      },
      // Add more column configurations
    ],
  });

  $("#wv-data-table").DataTable({
    ajax: {
      url: "/get_wv_data",
      dataSrc: "", // Data will be retrieved from this URL
    },
    columns: [
      {
        data: "datetime",
        render: function (data, type, row) {
          if (type === "display" || type === "filter") {
            // Define regular expressions to match both formats
            var dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
            var timeRegex = /(\d{1,2})[.:](\d{1,2})[.:](\d{1,2})/;

            // Try to match both date and time parts
            var dateMatch = data.match(dateRegex);
            var timeMatch = data.match(timeRegex);

            if (dateMatch && dateMatch.length === 4) {
              var year = parseInt(dateMatch[3]);
              var month = parseInt(dateMatch[2]) - 1; // Months are 0-based
              var day = parseInt(dateMatch[1]);

              if (timeMatch && timeMatch.length === 4) {
                var hour = parseInt(timeMatch[1]);
                var minute = parseInt(timeMatch[2]);
                var second = parseInt(timeMatch[3]);

                // Create a new Date object with date and time
                var date = new Date(year, month, day, hour, minute, second);
                return date.toLocaleDateString();
              } else {
                // Create a new Date object with date only
                var date = new Date(year, month, day);
                return date.toLocaleDateString();
              }
            }
          }
          return data;
        },
      },
      { data: "operator" },
      { data: "machine_number" },
      { data: "production_order" },
      { data: "bale_num" },
      { data: "stdTen" },
      { data: "devTen" },
      {
        data: null,
        render: function (data, type, row) {
          return (
            '<button class="wv-download-button" data-id="' +
            row.id +
            '">Download</button>'
          );
        },
      },
      // Add more column configurations
    ],
  });
});

$(document).on("click", ".tw-download-button", function () {
  var entryId = $(this).data("id");
  // Make an AJAX request to your Flask endpoint to initiate the download
  window.location.href = "/download_tw/" + entryId;
});

$(document).on("click", ".wv-download-button", function () {
  var entryId = $(this).data("id");
  // Make an AJAX request to your Flask endpoint to initiate the download
  window.location.href = "/download_wv/" + entryId;
});
