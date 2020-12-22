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
                    displayName: 'Name',
                    data: 'name',
                    class: 'text-center',
                    name: 'name',
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
                        '<button class="btn btn-danger delete mr-2">' +
                        '<i class="fas fa-trash"></i>' +
                        '</button>'
                        + '<button class="btn btn-info edit edit-record-link">' +
                        '<i class="fas fa-edit">' +
                        '</i>' +
                        '</button>'
                }
            ].map(i => ({
                ...i,
                defaultContent: i.defaultContent ? i.defaultContent : 'N/A'
            }));

            return {
                table: null,
                componentTitle: 'NGOs',
                componentName: 'NGOs',
                editComponentName: 'EditNGO',
                componentApiUrlPath: '/ngos',
                dataTableColumns: columns,
                dataTableColumnsDef: [
                    {
                        targets: app.getColumnIndexByName(columns, ['createdAt']),
                        render: function (data) {
                            return app.convertTsToDate(data)
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
