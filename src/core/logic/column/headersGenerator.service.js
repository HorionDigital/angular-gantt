(function(){
    'use strict';
    angular.module('gantt').service('GanttHeadersGenerator', ['GanttColumnHeader', 'moment', function(ColumnHeader, moment) {
        var generateHeader = function(columnsManager, headerName) {
            var generatedHeaders = [];
            var header;
            var customData;

            var viewScale = columnsManager.getHeaderScale(headerName);
            var customHeader = false;
            window.console.log(headerName);
            if (headerName === 'weather') {
                customData = columnsManager.gantt.options.value('customData').data;
                customHeader = headerName;
                viewScale = columnsManager.getHeaderScale(columnsManager.gantt.options.value('headers')[0]);
            }
            // console.log()

            var viewScaleValue;
            var viewScaleUnit;
            var splittedViewScale;

            if (viewScale) {
                splittedViewScale = viewScale.split(' ');
            }
            if (splittedViewScale && splittedViewScale.length > 1) {
                viewScaleValue = parseFloat(splittedViewScale[0]);
                viewScaleUnit = splittedViewScale[splittedViewScale.length - 1];
            } else {
                viewScaleValue = 1;
                viewScaleUnit = viewScale;
            }

            // window.console.log(viewScale, viewScaleValue, viewScaleUnit);

            if(columnsManager.columns.length > 0){
                var currentColumn = columnsManager.columns[0];
                var currentDate = moment(currentColumn.date).startOf(viewScaleUnit);

                var maximumDate = moment(columnsManager.columns[columnsManager.columns.length - 1].endDate);

                while (true) {
                    var currentPosition = currentColumn.getPositionByDate(currentDate);

                    var endDate = moment.min(moment(currentDate).add(viewScaleValue, viewScaleUnit), maximumDate);

                    var column = columnsManager.getColumnByDate(endDate);

                    var left = column.getPositionByDate(endDate);

                    var width = left - currentPosition;

                    if (width > 0) {
                        var labelFormat = columnsManager.getHeaderFormat(headerName);

                        if (customData && customData[viewScale][currentDate.toISOString()]) {
                            var dateData = customData[viewScale][currentDate.toISOString()].data || {};
                            // window.console.log(currentDate.toISOString(), dateData);
                            header = new ColumnHeader(currentDate, endDate, viewScaleUnit, currentPosition, width, labelFormat, headerName, customHeader, dateData);
                        } else {
                            header = new ColumnHeader(currentDate, endDate, viewScaleUnit, currentPosition, width, labelFormat, headerName, customHeader);
                        }
                        generatedHeaders.push(header);
                    }

                    if (endDate.isSame(maximumDate) || endDate.isAfter(maximumDate)) {
                        break;
                    }


                    currentColumn = column;
                    // window.console.log(column);
                    currentDate = endDate;
                }
            }


            return generatedHeaders;
        };

        this.generate = function(columnsManager) {
            var headerNames = [];
            if (columnsManager.gantt.options.value('headers') === undefined) {
                var viewScale = columnsManager.gantt.options.value('viewScale');
                viewScale = viewScale.trim();
                if (viewScale.charAt(viewScale.length - 1) === 's') {
                    viewScale = viewScale.substring(0, viewScale.length - 1);
                }

                var viewScaleUnit;
                var splittedViewScale;

                if (viewScale) {
                    splittedViewScale = viewScale.split(' ');
                }
                if (splittedViewScale && splittedViewScale.length > 1) {
                    viewScaleUnit = splittedViewScale[splittedViewScale.length - 1];
                } else {
                    viewScaleUnit = viewScale;
                }

                if (['quarter','month'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('year');
                }
                if (['day', 'week'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('month');
                }
                if (['day'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('week');
                }
                if (['hour'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('day');
                }
                if (['minute', 'second', 'millisecond'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('hour');
                }
                if (['second', 'millisecond'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('minute');
                }
                if (['millisecond'].indexOf(viewScaleUnit) > -1) {
                    headerNames.push('second');
                }
                headerNames.push(viewScale);
            } else {
                headerNames = columnsManager.gantt.options.value('headers');
            }

            var headers = [];
            for (var i=0; i<headerNames.length; i++) {
                headers.push(generateHeader(columnsManager, headerNames[i]));
            }

            return headers;
        };
    }]);
}());

