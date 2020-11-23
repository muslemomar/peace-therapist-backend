<template>

  <div class="DataSection">

    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">{{this.componentTitle}}</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
            <thead>

            <tr>
              <th v-for="(elem,index) of dataTableColumns" :key="index">{{elem.displayName}}</th>
            </tr>
            </thead>
            <tfoot>
            <tr>
              <th v-for="(elem,index) of dataTableColumns" :key="index">{{elem.displayName}}</th>
            </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>

    <DeleteModal/>


    <div class="modal fade" id="confirm-reject" tabindex="-1" role="dialog" aria-labelledby="confirmRejectLabel"
         aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmRejectLabel">Reject Store</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <form>

            <div class="modal-body">

              <div class="form-group">
                <label for="rejectReason">Reason</label>
                <input type="text" id="rejectReason" name="rejectReason" class="form-control" required>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
              <button type="submit" class="btn btn-danger" id="yes-modal-btn">Yes</button>
            </div>

          </form>

        </div>

      </div>
    </div>

    <div class="modal fade" id="confirm-accept" tabindex="-1" role="dialog" aria-labelledby="confirmAcceptLabel"
         aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmAcceptLabel">Accept Store</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you want to accept this store?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
            <button type="button" class="btn btn-primary yes-modal-btn">Yes</button>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
  import DeleteModal from "./DeleteModal";

  export default {
    name: this.componentName,
    components: {
      DeleteModal
    },
    data() {
      const app = this;

      let columns = [
        {
          displayName: 'Title',
          data: 'title',
          class: 'text-center',
          name: 'title',
        },
        {
          displayName: 'Verification Status',
          class: 'text-center',
          name: 'verifStatus',
          data: 'verifStatus',
          width: '170px',
          render: (data) => {
            let div = '';

            let showAcceptRejectButtons;
            let statusColorClass;
            if (data === 'ACCEPTED') {
              data = 'Verified';
              statusColorClass = 'success';
            } else if (data === 'REJECTED') {
              data = 'Rejected';
              statusColorClass = 'danger';
            } else {
              data = 'Waiting Approval';
              statusColorClass = 'secondary';
              showAcceptRejectButtons = true;
            }

            div += `<span class="badge badge-${statusColorClass} verif-status-text">${data}</span>`;
            if (showAcceptRejectButtons) {
              div += `<div class="mt-2">`;
              div += `<button class="btn btn-outline-success mx-1 accept">Accept</button>`;
              div += `<button class="btn btn-outline-danger mx-1 reject">Reject</button>`;
            }
            div += `</div>`;


            return div;
          }
        },
        {
          displayName: 'Owner Email',
          data: 'user.email',
          class: 'text-center',
          defaultContent: 'N/A',
          name: 'email',
        },
        {
          displayName: 'Work Hours',
          data: 'workDays',
          class: 'text-center',
          name: 'workDays',
        },
        {
          displayName: 'Average',
          data: 'avgRating',
          class: 'text-center',
          name: 'avgRating',
        },
        {
          displayName: 'Date Created',
          data: 'createdAt',
          class: 'text-center',
          name: 'createdAt',
        },
        {
          data: null,
          width: '100px',
          class: 'text-center',
          defaultContent:
            '<button class="btn btn-success add-product-link m-1">' +
            '<i class="fas fa-plus"></i>' +
            '</button>'
            + '<button class="btn btn-warning products-link m-1">' +
            '<i class="fas fa-list"></i>' +
            '</button>'
            + '<button class="btn btn-danger delete m-1">' +
            '<i class="fas fa-trash"></i>' +
            '</button>'
            + '<button class="btn btn-info edit edit-record-link m-1">' +
            '<i class="fas fa-edit">' +
            '</i>' +
            '</button>'
        }
      ];

      return {
        table: null,
        componentTitle: 'Stores',
        componentName: 'Stores',
        editComponentName: 'EditStore',
        addProductComponentName: 'CreateStoreProduct',
        productsComponentName: 'StoreProducts',
        componentApiUrlPath: '/stores',
        dataTableColumns: columns,
        dataTableColumnsDef: [
          {
            targets: app.getColumnIndexByName(columns, ['createdAt']),
            render: function (data) {
              return app.convertTsToDate(data)
            }
          },
          {
            targets: app.getColumnIndexByName(columns, ['workDays']),
            render: function (data) {
              return data[0].from + ' - ' + data[0].to;
            }
          }
        ]
      };
    },
    methods: {
      setupTable() {
        const app = this;

        this.table = $('#dataTable').DataTable({
          processing: true,
          responsive: true,
          serverSide: true,
          ajax: {
            url: this.componentApiUrlPath,
            dataType: 'json',
            xhrFields: {withCredentials: true},
          },
          rowId: '_id',
          columns: this.dataTableColumns,
          columnDefs: this.dataTableColumnsDef,
          order: [app.getColumnIndexByName(app.dataTableColumns, 'createdAt'), 'desc'],
          fnInitComplete: function (oSettings, json) {

            app.hideLoadingBar();

            const params = app.$route.params;
            if (params.id) {
              app.selectRowById(this.api(), params.id);
            }

          }
        });

      },
      setupDoms() {
        const app = this;
        const tableBody = $('#dataTable tbody');
        tableBody.on('click', 'button.delete', function () {
          $('#confirm-delete').modal('show').data($(this));
        });

        $('#confirm-delete #yes-modal-btn').on('click', () => {

          this.showLoadingBar();
          const modal = $('#confirm-delete');
          const row = modal.data();

          row.parents('tr').addClass('clicked');
          app.onRecordDelete(app.table.row(row.parents('tr')).id());
          modal.modal('hide')
        });

        tableBody.on('click', 'button.reject', function () {
          $('#confirm-reject').modal('show').data($(this));
        });

        tableBody.on('click', 'button.accept', function () {
          $('#confirm-accept').modal('show').data($(this));
        });

        $('#confirm-reject #yes-modal-btn').on('click', () => {

          const rejectReasonInput = $('#rejectReason');
          if (rejectReasonInput.val()) {
            const modal = $('#confirm-reject');
            const row = modal.data();
            row.parents('tr').addClass('clicked');
            app.onReject(app.table.row(row.parents('tr')).id(), rejectReasonInput.val());
            modal.modal('hide');
            rejectReasonInput.val('');
          }

        });

        $('#confirm-accept .yes-modal-btn').on('click', () => {

          this.showLoadingBar();
          const modal = $('#confirm-accept');
          const row = modal.data();

          row.parents('tr').addClass('clicked');
          app.onAccept(app.table.row(row.parents('tr')).id());
          modal.modal('hide')

        });

        tableBody.on('click', 'button.add-product-link', function () {
          const id = app.table.row($(this).parents('tr')).id();

          app.$router.push({name: app.addProductComponentName, params: {id: id}});
        });

        tableBody.on('click', 'button.products-link', function () {
          const id = app.table.row($(this).parents('tr')).id();

          app.$router.push({name: app.productsComponentName, params: {id: id}});
        });

        tableBody.on('click', 'button.edit-record-link', function () {

          const id = app.table.row($(this).parents('tr')).id();
          app.$router.push({name: app.editComponentName, params: {id: id}});

        });
      },
      onRecordDelete(recordId) {

        this.$http.delete(`${this.componentApiUrlPath}/${recordId}`,
          {withCredentials: true}).then((res) => {

          this.hideLoadingBar();
          this.table.row('.clicked').remove().draw()

        }).catch((err) => {
          this.hideLoadingBar();
        })
      },
      onReject(recordId, rejectReason) {
        this.showLoadingBar();

        this.$http.patch(
          `${this.componentApiUrlPath}/${recordId}/status`,
          {
            rejectReason: rejectReason,
            verifStatus: 'REJECTED'
          },
          {withCredentials: true}).then((res) => {

          this.hideLoadingBar();
          this.table.row('.clicked').remove().draw()

        }).catch((err) => {
          this.hideLoadingBar();
        })
      },
      onAccept(recordId) {
        this.$http.patch(
          `${this.componentApiUrlPath}/${recordId}/status`,
          {
            verifStatus: 'ACCEPTED'
          },
          {withCredentials: true}).then((res) => {

          this.hideLoadingBar();
          this.table.row('.clicked').remove().draw()

        }).catch((err) => {
          this.hideLoadingBar();
        })
      }
    },
    created() {
      this.showLoadingBar();
    },
    mounted: function () {
      this.setupTable();
      this.setupDoms();
    }
  }
</script>

<style>

</style>
