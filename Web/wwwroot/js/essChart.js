

// BEGIN "essChart" namespace wrapper
(function (essChart, $, undefined) {
    $(document).ready(function () {
        Chart.defaults.animation.duration = 200;
    });

    essChart.htmlLegendPlugin = {
        id: 'htmlLegend',
        afterUpdate(chart, args, options) {
            var chartParent = $(chart.canvas).parent();
            var ul = chartParent.siblings('.chart__info').find('.chart__legend');

            if (ul.length == 0) {
                chartParent.after('<ul class="chart__legend"></ul>');
                ul = chartParent.siblings('.chart__info').find('.chart__legend');

            }
            // Remove old legend items
            ul.html('');

            // Reuse the built-in legendItems generator
            const items = chart.options.plugins.legend.labels.generateLabels(chart);

            items.forEach(item => {
                var li = $('<li class="chart__legendItem' + (chart.isDatasetVisible(item.datasetIndex) ? ' active' : '') + '"></li > ');

                li.on('click', function () {
                    let configType = chart.config;
                    if (configType === 'pie' || configType === 'doughnut') {
                        chart.toggleDataVisibility(item.index); // Pie and doughnut charts only have a single dataset and visibility is per item
                    } else {
                        chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                    }
                    chart.update();
                });

                var span = $('<span class="chart__colorKey"></span>').css({ border: '3px ' + (item.lineDash.length > 0 ? 'dashed' : 'solid') + ' ' + item.strokeStyle, background: item.fillStyle });

                li.append(span);
                li.append(item.text.replace('Factory Default ', '').replace('Machine Specific ', ''));

                ul.append(li);
            });

        }
    };

    essChart.getColor = function (sortOfIndex) {
        //colors pulled from Engineering Tools Library Graph Data Class
        var colors = ['#0000FF', '#FF0000', '#864FFF', '#00FF00']//, '#FF8726', '#00FFFF', '#FF00FF', '#888800', '#008800', '#000', '#880000', '#008888', '#888888', '#880088', '#FFFF00', '#FFC089', '#FAC1FF', '#BAFFC3'];
        //Blue, Red, DeepPurple, Green, Orange, Cyan, Purple, Olive, DarkGreen, Black, Maroon, GreenBlue, Grey, DarkPurple, Yellow, Peach, Violet, LightGreen

        //restricted to 4 colors to simplify the graph display
        return colors[sortOfIndex % colors.length];
    }

}(window.essChart = window.essChart || {}, jQuery));