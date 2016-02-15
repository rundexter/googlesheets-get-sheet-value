var _           = require('lodash')
  , Spreadsheet = require('edit-google-spreadsheet')
  , assert      = require('assert')
;

module.exports = {
    pickSheetData: function (rows, startRow, startColumn, numRows, numColumns) {
        var sheetData = []
          , row = []
        ;

        for (var rowKey = startRow; rowKey <= numRows; rowKey++) {
            row = [];
            sheetData.push(row);
            for (var columnKey = startColumn; columnKey <= numColumns; columnKey++) {
                if (rows[rowKey] !== undefined && rows[rowKey][columnKey] !== undefined) {
                    row.push(rows[rowKey][columnKey]);
                }
            }
        }

        return sheetData;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var spreadsheetId = step.input('spreadsheet_id').first()
          , worksheetId   = step.input('worksheet', 1).first() || 1
          , startRow      = step.input('startRow', 1).first() || 1
          , startColumn   = step.input('startColumn', 1).first() || 1
          , numRows       = step.input('numRows').first() || 10
          , numColumns    = step.input('numColumns').first() || 10
          , options
        ;

        assert(spreadsheetId, "Spreadsheet key required. Look for it in the spreadsheet's URL (e.g. https://docs.google.com/spreadsheets/d/<spreadsheet_id>/edit)");

        options = {
            debug: true,
            spreadsheetId : spreadsheetId,
            worksheetId   : worksheetId,
            accessToken   : {
                type      : 'Bearer',
                token     : dexter.provider('google').credentials('access_token')
            }
        };

        Spreadsheet.load(options, function (err, spreadsheet) {
            if (err)
                this.fail(err);
            else
                spreadsheet.receive({getValues: true}, function (error, rows) {
                    this.log(error);
                    return error
                       ? this.fail(error) 
                       : this.complete({values: this.pickSheetData(rows, startRow, startColumn, numRows, numColumns)})
                    ;
                }.bind(this));
        }.bind(this));
    }
};
