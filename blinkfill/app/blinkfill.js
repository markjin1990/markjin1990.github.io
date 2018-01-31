function getInputList(data, ncols, nrows) {
    inputList = [];
    for (var r = 0; r < nrows; r++) {
        inputList[r] = [];
        for (var c = 0; c < ncols - 1; c++) {
            inputList[r][c] = data[r][c];
        }
    }
    return inputList;
}

function getInputOutputExampleList(data, ncols, nrows) {
    inputOutputExampleList = [];
    for (var r = 0; r < nrows; r++) {
        if (data[r][ncols - 1] != "" && data[r][ncols - 1] != null) {
            inputRow = [];
            inputOutputExample = [];
            for (var c = 0; c < ncols - 1; c++) {
                inputRow.push(data[r][c]);
            }  
            inputOutputExample.push(inputRow);
            inputOutputExample.push(data[r][ncols - 1]);
            inputOutputExampleList.push(inputOutputExample);
        }
        
    }
    return inputOutputExampleList;
}

function callBlinkFillAPI() {

    var TableData = hot.getData();
    var totalCols = TableData[0].length;
    var totalRows = TableData.length;
    var ncols = totalCols, nrows=totalRows;

    for (var c = 0; c < totalCols; c++) {
        if (TableData[0][c]==null || TableData[0][c] == "") {
            ncols = c;
            break;
        }
    }

    for (var r = 0; r < totalRows; r++) {
        if (TableData[r][0]==null || TableData[r][0] == "") {
            nrows = r;
            break;
        }
    }

    var outCol = ncols - 1;

    var inputList = getInputList(TableData, ncols, nrows);

    var inputOutputExampleList = getInputOutputExampleList(TableData, ncols, nrows);
    
    var inputRowStrings = [];
    for(var i=0; i<inputList.length; i++){
        inputRowStrings.push(inputList[i].join("<->"));
    }

    var inputListString = inputRowStrings.join("<|>");

    inputOutputExampleRowStrings = []
    for (var i = 0; i < inputOutputExampleList.length; i++) {
        inputOutputExampleRowStrings.push(inputOutputExampleList[i][0].join("<->") + "-->" + inputOutputExampleList[i][1]);
    }

    var inputOutputExampleListString = inputOutputExampleRowStrings.join("<|>");
    console.log("inputListString: ", inputListString);
    console.log("inputOutputExampleListString: ", inputOutputExampleListString);

    callAPI = function () {
        var learningData = {
            'vals': inputListString,
            'examples': inputOutputExampleListString
        };

        $('#loadingmessage').show();
        $.ajax({
            type: "POST",
            cache: false,
            url: "https://conditionalblinkfillapi.azurewebsites.net/api/CondBlinkFill",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                inputRowStrings: inputListString,
                inputOutputExamples: inputOutputExampleListString
            }),
            success: function (data) {
                // alert("Success!" + data);

                for (var i = 0; i < data.length; i++) {
                    hot.setDataAtCell(i, outCol, data[i]); 
                }
                hot.render();

                // if (data[data.length-1] == "-1"){
                //     AmbiguityInfo += "No Ambiguous Input!";
                // }
                // else{
                //     AmbiguityInfo += "Input in Row " + data[data.length-1] + " looks ambiguous. Please inspect.";
                // }
                $("#browser_iframe").contents().find('body').html("");
                $("#browser_iframe").contents().find('body').append("Success");
                $('#loadingmessage').hide();
            },
            error: function (err) {
                $("#browser_iframe").contents().find('body').html("");
                $("#browser_iframe").contents().find('body').append("Sorry, BlinkFill can't learn this transformation yet.");
                console.log();
                $('#loadingmessage').hide();
            }
        });
    };

    callAPI();
}