var body = $("html, body");
var t = $("#tableDados").DataTable({
    "info": true,
    "paging": false,
    "order": []
});

$(".ziehharmonika").ziehharmonika({
    highlander: false,
    collapsible: true,
    scroll: false
});
//$('.ziehharmonika h3:eq(3)').ziehharmonika('open');
//$('.ziehharmonika h3:eq(0)').ziehharmonika('open');
$('input[type="range"]').rangeslider({
    polyfill : false,
    onInit : function() {
        this.output = $( '<div class="range-output" />' ).insertAfter( this.$range ).html( this.$element.val() + "px" );
    },
    onSlide : function( position, value ) {
        this.output.html( value + "px" );
    }
});     

var dados = {
    title: 'Motivos de cancelamento/devolução de pedidos em Nov/19',
    xAxisTitleLeft: 'Frequência em quantidade',
    xAxisTitleRight: 'Frequência Acumulada em %',
    seriesPercentName: '% Acumudado',
    seriesValName: 'Casos Identificados',
    colorCol: '#75AC8A',
    colorLine: '#7b5baf',
    lineWidth: 3,
    columnPadding: 0,
    minLeftAxys: 0,
    maxLeftAxys: null,
    minRightAxys: 0,
    maxRightAxys: 100,
    lineMarkerRadius: 5,
    abcEnabled: true,
    data : [
        {t:'Sepração errada', d:45},
        {t:'Faturamento Inconrreto', d:60},
        {t:'Atraso na transportadora', d:125},
        {t:'Pedido Errado', d:30},
        {t:'Atraso na Entrega', d:140},
        {t:'Não Gostou', d:17},
        {t:'Danificado durante a entrega', d:10},
        {t:'Cliente pediu errado', d:18},
        {t:'Preço errado', d:20},
        {t:'Produto com defeito', d:65},
        {t:'Outros', d:8},
    ],
    classeA: 0, //80% de 20% dos itens 80/20
    classeB: 0, //15%
    classeC: 0 //5%
};


dados.classeA = dados.data.length*0.2;
dados.classeB = dados.data.length*0.5;

sortDesc();
tableUpdate();

categories = []; values = [];
$.each(dados.data, function( index, value ) {
    categories.push(value.t);
    values.push(value.d);
});



var chart = Highcharts.chart('graph', {
    chart: { renderTo: 'graph',   type: 'column' },
    title: { text: dados.title },
    tooltip: {
        shared: true,
        useHTML: true,
        headerFormat: '<b style="margin-bottom: 10px; border-bottom: 1px solid #ccc;">{point.key}</b><table>',
        footerFormat: '</table>'
    },
    xAxis: {
        categories: categories,
        crosshair: true,
        plotLines: abcUpdate()
    },
    yAxis: [
        { title: {  text: dados.xAxisTitleLeft },
            max: dados.maxLeftAxys,  min: dados.minLeftAxys
        }, //eixo esquerdo
        { title: {  text: dados.xAxisTitleRight }, //eixo direito
            minPadding: 0,  maxPadding: 0,  max: dados.maxRightAxys,  min: dados.minRightAxys,  opposite: true,  labels: {  format: "{value}%" }
        }
    ],
    plotOptions: {
        series: {
            shadow: true,
            states: {
                hover: {
                    enabled: false,
                }
            }
        }
    },
    series: [
        { type: 'pareto',  name: dados.seriesPercentName,  yAxis: 1,  zIndex: 3,  baseSeries: 1,
            lineWidth: dados.lineWidth,
            color: '#7b5baf',
            marker: {
                symbol: 'circle',
                fillColor: '#FFFFFF',
                lineColor: null,
                lineWidth: 3,
                radius: dados.lineMarkerRadius
            },
            labels: {  format: "{value:.2f}%" },
            tooltip: { pointFormat: '<tr><td>{series.name}: </td>' +
                '<td style="text-align: right"><b>{point.y:.2f}%</b></td></tr>'}
        }, 
        { name: dados.seriesValName, type: 'column', zIndex: 2,  data: values,
            opacity: 0.9,
            pointPadding: dados.columnPadding,
            color: '#75AC8A',
            labels: { format: "{value}" },
            tooltip: { pointFormat: '<tr><td>{series.name}: </td>' +
                '<td style="text-align: right"><b>{point.y}</b></td></tr>'}
        }
    ]
});

charUpdate();


$("#formBasic input").change(function (e) {
    let elem = $(this).attr("id");
    dados[elem] = $(this).val();
    charUpdate();
    alerts('success', elem + ' atualizado!', 2);
});

$("#formAdvanced input").change(function (e) {
    let elem = $(this).attr("id");
    dados[elem] = $(this).val();
    charUpdate();
    alerts('success', elem + ' atualizado!', 2);
});

$("#formInsert").submit(function(e) {
    let name = $("#nameInsert").val();
    let ok = true;
    $.each(dados.data, function( index, value ) {
        if(value.t == name){
            ok = false;
        }
    });

    if (ok) {
        let value = parseInt($("#valueInsert").val());
        let pos = dados.data.push({t: name, d: value});
        sortDesc();
        tableUpdate();
        charUpdate();
        alerts('success', name + ' adicionado com sucesso!', 2);
    } else {
        alerts('danger', name + ' já existe, tente um nome diferente!', 2);
    }
    e.preventDefault();
});

$("#formUpdate").submit(function(e) {
    let name = $("#nameUpdate").val();
    let value = parseInt($("#valueUpdate").val());
    let index = $("#idUpdate").html();
    dados.data[index] = {t: name, d: value};
    sortDesc();
    tableUpdate();
    charUpdate();
    alerts('success', name  +':' + value + ', atualizado com sucesso!', 2);
    $("#rowUpdateCancel").trigger("click");
    e.preventDefault();
});


$(document).on('click', '#tableDados td a.remove', function(e) {
    let index = $(this).attr('data');
    let dataRemove = dados.data[index];

    swal({
        title: "Tem certeza?",
        text: "Deseja mesmo remover " + dataRemove.t + ":" + dataRemove.d + " ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((res) => {
        if (res) {
            let remove = dados.data.splice(index, 1);
            tableUpdate();
            charUpdate();
            alerts('success', dataRemove.t  +', removido com sucesso!', 2);
        } else {
            $("#alerts").html("");
        }
    });
    e.preventDefault();
});



$("#rowUpdateCancel").click(function() {
    $("#formInsert").show("fast");
    $("#formUpdate").hide("fast");
    $("#nameUpdate").val("");
    $("#valueUpdate").val("");
    $("#idUpdate").html("");
});

$(document).on('click', '#tableDados td a.edit', function(e) {
    let index = $(this).attr('data');
    let dataEdit = dados.data[index];
    if(dataEdit) {
        $("#formInsert").hide("fast");
        $("#formUpdate").show("fast");
        $("#nameUpdate").val(dataEdit.t);
        $("#valueUpdate").val(dataEdit.d);
        $("#idUpdate").html(index);
    }
    e.preventDefault();
});

/* Exibir alerta ao atualizar
$(window).bind('beforeunload', function(){
    return "teste";
});*/
$(window).keydown(function(e) {
    return true;
    if(e.which == 116){
        e.preventDefault();
        e.stopPropagation();
        swal({
            title: "Tem certeza ?",
            text: "Deseja mesmo atualizar a página ? \nSeus dados serão perdidos!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((res) => {
            if (res) {
                location.reload();
                return true;
            } else {
                return false;
            }
        });
        
    }
    
});

function alerts(type, msg, time) {
    $("#alerts").html(
        '<div class="alert alert-'+ type +' alert-dismissible fade show shadow2" role="alert">'
        +'<strong>'+ msg +'</strong> '
        +'<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
        +'<span aria-hidden="true">&times;</span>'
        +'</button>'
        +'</div>'
    );
    setTimeout(function() {
        $(".alert").alert('close');
    }, time*1000);
}


function sortDesc(){
    dados.data.sort(function(a,b){
        if(a.d < b.d) return 1
        if(a.d > b.d) return -1
        return 0;
    });
}

function tableUpdate() {
    t.clear();
    $.each(dados.data, function( index, value ) {
        t.row.add([
            value.t, value.d, 
            "<a href='#' class='edit' title='"+index+"' data='"+index+"'><i class='fa fa-pencil-square-o'></i></a>", 
            "<a href='#' class='remove' title='"+index+"' data='"+index+"'><i class='fa fa-trash-o danger'></i></a>"
        ]).draw(false);
    });
}

function abcUpdate() {
    $abcEnabledRes = null;
    if(dados.abcEnabled){
        $abcEnabledRes = [
            { color: '#FF0000', width: 2,  zIndex: 4,  value: dados.classeA },
            { color: '#e94d0a', width: 1,  zIndex: 4,  value: dados.classeB }
        ];
    }
    return $abcEnabledRes;
}



function charUpdate() {
    $({deg: 0}).animate({deg: 360}, {
        duration: 1000,
        step: function(now) {
            $(".refresh-graph i").css({
                transform: 'rotate(' + now + 'deg)'
            });
        }
    });

    categories = []; values = [];
    $.each(dados.data, function( index, value ) {
        categories.push(value.t);
        values.push(value.d);
    });

    chart.update({
        title: { text: dados.title },
        xAxis: { categories: categories, plotLines: abcUpdate() },
        yAxis: [
            { title: {  text: dados.xAxisTitleLeft },
                max: dados.maxLeftAxys,  min: dados.minLeftAxys,
            }, //eixo esquerdo
            { title: {  text: dados.xAxisTitleRight }, //eixo direito
                max: dados.maxRightAxys,  min: dados.minRightAxys
            }
        ],
        plotOptions: {
            series: {
                shadow: true
            }
        },
        series: [
            { name: dados.seriesPercentName, yAxis: 1, color: dados.colorLine, lineWidth: dados.lineWidth,
                marker: {
                    radius: dados.lineMarkerRadius
                }
            }, 
            { name: dados.seriesValName, data: values, color: dados.colorCol, pointPadding: dados.columnPadding, }
        ]
    });
}