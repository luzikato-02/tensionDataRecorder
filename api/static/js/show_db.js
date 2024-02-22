$(document).ready(function () {
  $("#tw-data-table").DataTable({
    ajax: {
      url: "/get_tw_data",
      dataSrc: "", // Data will be retrieved from this URL
    },
    columns: [
      { data: "id" },
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
      { data: "id" },
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

$('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  DataTable.tables({ visible: true, api: true }).columns.adjust();
});