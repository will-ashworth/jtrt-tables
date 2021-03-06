function JtrtTables(tableContainer){

	this.container = tableContainer;
	Iam = this;
	this.rowCount = this.container[0].rows.length - 2;
	this.colCount = this.container.find('thead tr:first-child td').length - 2;
	this.alpC = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
	this.jtModal = jQuery('#jtrt_edit_row_modal');
	this.jtColModal = jQuery('#jtrt_edit_col_modal');
	this.colBreakpoints = "";
	this.postID = jQuery('#post_ID').val();
	this.jtModalHiddenNav = this.jtModal.find("#jtmodal_hidden_nav");
	this.loader = "<div id='jt_loader_ad'><div class='uil-cube-css' style='-webkit-transform:scale(0.5)'><div></div><div></div><div></div><div></div></div></div>";
	this.defaultColSort = 1; 
	

	this.container.find('td.jt_addrowcol').on('click', function(element){
		if(jQuery(this).attr('data-jttable-controller') == "rowAdd"){
			Iam.addRows();
			return;
		}
		Iam.addCols();
	});
	
	jQuery(window).keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
	});

	if(this.postID !== undefined){
		this.container.addClass("jtrt_table_" + this.postID);
	}
	
	this.container.siblings('h2').remove();
	this.container.siblings('p').remove();
	this.container.removeClass('table table-striped table-hover table-condensed table-bordered');

	var exampleClass = this.container.attr('class').match(/jtrt_\d+_exStyle_example\d+/g);
	if(exampleClass != null){
		this.container.removeClass(exampleClass[0]);
	}

	this.container.on('click','td.jtrt_custom_td:not(:last-child)', function(elem){
		Iam.editRow(jQuery(this));
	});
	
	this.container.on('click','tr.jtrt_custom_header td:not(:last-child):not(:first-child)', function(elem){
		Iam.editCol(jQuery(this));
	});
	
	this.jtModal.find('#jt-table-delete-btn').on('click',function(){
		Iam.handleTDDelete("row");	
	});

	this.jtModal.find('#jt-table-move-btn').on('click',function(){
		Iam.moveRow();
	});
	
	this.jtColModal.find('#jt-table-delete-btn-col').on('click',function(){
		Iam.handleTDDelete("col");	
	});

	this.jtModal.find("tr").on('click',".redit_modal_theader span",function(ev){
		ev.preventDefault();
		Iam.showModalHiddenNav(jQuery(this).parent().prevAll().length);
	});

	jQuery(document).on("click","body",function(ev){
		if(jQuery(ev.target).is("span") || jQuery(ev.target).is("#jtmodal_hidden_nav ul"))
			return;
		if(Iam.jtModalHiddenNav.hasClass("shownNav"))
			Iam.closeHiddenNav();	
	});

	this.changeColType = function(indx){
		this.container.find("tr.sorted_head td:not(.jtrt_custom_td)").eq(indx).attr("data-type","html");
	}

	var imgDialog = this.jtModal.find( "#dialog-form-image" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "Insert An Image": function(){
			var elem = imgDialog.data("Params").myElem,
				link = imgDialog.find("#link").val(),
				widthsss = imgDialog.find("#width").val(),
				heightsss = imgDialog.find("#height").val();
			
			elem.val("<img src='"+link+"' width='"+widthsss+"' height='"+heightsss+"' >");
			imgDialog.dialog("close");
		},
        Cancel: function() {
          imgDialog.dialog( "close" );
        }
      },
	  close: function() {
        imgDialog.find("input").val("");
      }
    });

	var linkDialog = this.jtModal.find( "#dialog-form-link" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "Insert link": function(){
			var elem = linkDialog.data("Params").myElem,
				link = linkDialog.find("#link2").val(),
				name = linkDialog.find("#name").val();
			
			elem.val("<a href='"+link+"' target='_blank'>"+name+"</a>");
			linkDialog.dialog("close");
		},
        Cancel: function() {
          linkDialog.dialog( "close" );
        }
      },
	  close: function() {
        linkDialog.find("input").val("");
      }
    });

	this.jtModalHiddenNav.on("click","li",function(){
		
		var thisId = jQuery(this).children("a").attr("id"),
			thisIndex = Iam.jtModalHiddenNav.parent().parent().prevAll().length,
			inputElem = Iam.jtModal.find("table tr:last-child td").eq(thisIndex).children("input");

		switch (thisId) {
			case "bold":
				var currentVal = inputElem.val();
				if(currentVal.indexOf("<strong>") != -1)
					return;
				inputElem.val("<strong>"+currentVal+"</strong>");
				Iam.changeColType(thisIndex);
				break;
				
			case "italic":
				var currentVal = inputElem.val();
				if(currentVal.indexOf("<em>") != -1)
					return;
				inputElem.val("<em>"+currentVal+"</em>");
				Iam.changeColType(thisIndex);
				break;

			case "image":
				imgDialog.data( "Params", { myElem: inputElem, thisIndex: thisIndex } ).dialog( "open" );
				Iam.changeColType(thisIndex);
				break;

			case "link":
				linkDialog.data( "Params", { myElem: inputElem, thisIndex: thisIndex } ).dialog( "open" );
				Iam.changeColType(thisIndex);
				break;
		}



	});

	
	this.jtColModal.find('a').on('click',function(e){
		e.preventDefault();
		jQuery(this).toggleClass('active');
		var edittingCol = jQuery(this).parents('#jtrt_edit_col_modal').attr('data-jt-col-editting');
		var hideThisCol = jQuery(this).attr('id');
		var breakpoints = Iam.container.find('thead tr:last-child td').eq(edittingCol);
		if(breakpoints.attr('data-breakpoints') === ""){
			Iam.colBreakpoints = [];
		}else{
			Iam.colBreakpoints = breakpoints.attr('data-breakpoints').split(" ");
		}
		
		var arrayLocation = jQuery.inArray(hideThisCol,Iam.colBreakpoints);
		
		
		if(arrayLocation !== -1){
			Iam.colBreakpoints.splice(arrayLocation,1);
			breakpoints.attr('data-breakpoints', Iam.colBreakpoints.toString().replace(/,/g," "));
		}else{
			Iam.colBreakpoints.push(hideThisCol);
			breakpoints.attr('data-breakpoints', Iam.colBreakpoints.toString().replace(/,/g," "));
		}
		
		Iam.checkForHiddenCols(breakpoints);
		
	});
	
	this.jtColModal.find('select').on('change',function(){
		var edittingCol = jQuery(this).parents('#jtrt_edit_col_modal').attr('data-jt-col-editting');
		Iam.container.find('thead tr:last-child td').eq(edittingCol).attr('data-type', jQuery(this).val());
	});
	
	this.checkForHiddenCols = function(bp){
		if(bp.attr('data-breakpoints') === ""){
			bp.removeClass('hasHiddenCols');
		}else{
			bp.addClass('hasHiddenCols');
		}
	}
	
	this.jtLoader = function(opt){
		if(opt == "show"){
			jQuery(this.loader).appendTo('#wpcontent');
		}else{
			jQuery('#wpcontent').find("#jt_loader_ad").remove();
		}
	}
	
	this.addRows = function(data,index){
		this.rowCount++;
		var insertedRow;
		
		if(this.rowCount === 1){
			this.container.find('thead').append("<tr class='sorted_head'></tr>");
			insertedRow = this.container.find('thead tr:last-child');
		}else{
			insertedRow = this.container[0].insertRow(this.rowCount);
		}

		for(var i = 0; i <= this.colCount; i++){
			if(i === 0){
				jQuery(insertedRow).append('<td class="jtrt_custom_td">'+this.rowCount+'</td>');
			}else if(data && this.rowCount !== 1){
				jQuery(insertedRow).append('<td>'+data[index][i - 1]+'</td>');
			}else if(this.rowCount === 1 && data){
				jQuery(insertedRow).append('<td data-breakpoints="" data-type="text">'+data[index][i - 1]+'</td>')
			}else{
				jQuery(insertedRow).append('<td>cell '+ i +'</td>');
			}
		}
	}

	this.addCols = function(data,index){
		this.colCount++;
		var cellData = "cell " + this.colCount;
		for(var i = 0; i < this.rowCount + 1; i++){
			
			if(i === 0){
				jQuery(this.container.find('tr')[i].insertCell(this.colCount)).html(this.alpC[this.colCount -1]);
			}else{
				jQuery(this.container.find('tr')[i].insertCell(this.colCount)).html(cellData).attr('data-breakpoints',"").attr('data-type','text');
			}

		}
	}	


	this.editRow = function(elem){
		var data = [];
		elem.parent().find('td:not(:first-child)').each(function(i,elem){
			data.push(jQuery(elem).html());
		});
		this.launchEditModal(data,elem.parent()[0].rowIndex);
	}

	this.moveRow = function(){
		
		var moveRowSelect = this.jtModal.find("#jt_moveRowTo").val(),
			currentRow = this.jtModal.attr('data-jt-row-editting'),
			currentRowElem = Iam.container.find("tbody tr").eq(currentRow - 2)
			movedToElem = Iam.container.find("tbody tr").eq(moveRowSelect - 2);

		if(moveRowSelect == currentRow)
			return;
		
		if(parseInt(moveRowSelect) > parseInt(currentRow))
			currentRowElem.insertAfter(movedToElem);
		else
			currentRowElem.insertBefore(movedToElem);	

		this.recountRows();
		this.jtModal.modal('hide');
		
	}
	
	this.editCol = function(elem){
		var data = [];
		var colIndex = elem[0].cellIndex; // the cell index for the selected column

		this.container.find('thead tr:not(:first-child), tbody tr:not(:last-child)').each(function(i,elem){
			data.push(jQuery(elem).children('td').eq(colIndex).html());
		});

		this.launchEditColModal(data,colIndex);
	}




	this.launchEditModal = function(data1,rowID){
		this.jtModal.find('.modal-body p').text("You are now editting row " + rowID);
		var modalForm = this.jtModal.find('.modal-body .jtrt_edit_cont table tr');
		var tableHeaderData = [];
		this.container.find('thead tr:nth-child(2) td:not(:first-child)').each(function(i,elem){
			tableHeaderData.push(jQuery(this).html());
		});
		
		this.jtModal.attr('data-jt-row-editting', rowID);
		modalForm.html("");
		for(var i = 0; i < data1.length; i++){
			var theadData = "<td class='redit_modal_theader'>"+ tableHeaderData[i] +" <span class='dashicons dashicons-admin-generic'></span></td>";
			var tbodyData = "<td><input id='column"+ i +"' type='text' value='"+ data1[i] +"' ></td>";
			
			modalForm.eq(0).append(theadData);
			modalForm.eq(1).append(tbodyData);
		}

		if(rowID === 1){
			this.jtModal.find("#jt-table-move-btn, #jt_moveRowTo, #jt_moveRowToLabel").hide();
		}else{
			this.jtModal.find("#jt-table-move-btn, #jt_moveRowTo, #jt_moveRowToLabel").show();
		}

		var moveRowSelect = this.jtModal.find("#jt_moveRowTo");
		moveRowSelect.html("");
		for(var i = 2;i<=this.rowCount;i++){
			if(i == rowID){
				moveRowSelect.append("<option value='"+ i +"' selected>Row "+ i +"</option>");
			}else{
				moveRowSelect.append("<option value='"+ i +"'>Row "+ i +"</option>");
			}
		}

		this.jtModal.modal('show');
	}

	this.showModalHiddenNav = function(indx){
		this.jtModalHiddenNav.appendTo(Iam.jtModal.find(".redit_modal_theader span").eq(indx));
		this.jtModalHiddenNav.addClass("shownNav");
		this.jtModalHiddenNav.fadeIn("fast");
	}

	this.closeHiddenNav = function(){
		this.jtModalHiddenNav.fadeOut("fast");
		this.jtModalHiddenNav.removeClass("shownNav");
		window.setTimeout(function(){
			Iam.jtModalHiddenNav = Iam.jtModal.find("#jtmodal_hidden_nav").detach();
		},300);
		
	}

	this.launchEditColModal = function(data,colID){

		this.jtColModal.find('.modal-body p').text("You are now editting column " + colID);
		var modalForm = this.jtColModal.find('.modal-body div.jt_col_form_cont table');
		var hiddenCols = this.container.find('thead tr:last-child td').eq(colID).attr('data-breakpoints');
		var colDataType = this.container.find('thead tr:last-child td').eq(colID).attr('data-type');
				
		this.jtColModal.find('a').removeClass('active');
		this.jtColModal.find('select').val(colDataType);
		
		if(hiddenCols !== ""){
			hiddenCols = hiddenCols.split(" ");
			for(var i = 0; i < hiddenCols.length; i++){
				this.jtColModal.find('a#'+hiddenCols[i]).addClass('active');
			}
		} 
		this.jtColModal.attr('data-jt-col-editting', colID);
		modalForm.html("");
		for(var i = 0; i < data.length; i++){
			var input = "<tr><td>Row "+(i+1)+"</td><td><input id='row"+i+"' type='text' value='"+data[i]+"'></td></tr>";
			modalForm.append(input);
		}
		this.jtColModal.modal('show');
	}

	this.handleModalRowSave = function(){
		this.jtModal.find('#jt-table-save-btn').on('click',function(){
			var rowID = Iam.jtModal.attr('data-jt-row-editting');
			var data = Iam.jtModal.find('.modal-body .jtrt_edit_cont input').map(function(i,e){
				return jQuery(e).val();
			});
			
			var edittedRow = Iam.container.find("tr").eq(rowID);
			for(var i = 0; i < data.length; i++){
				edittedRow[0].cells[i+1].innerHTML = data[i];
			}
			
			Iam.jtModal.modal('hide');

		});
		
		this.jtColModal.find('#jt-table-save-btn-col').on('click',function(){
			var colID = Iam.jtColModal.attr('data-jt-col-editting');
			var data = Iam.jtColModal.find('.modal-body div.jt_col_form_cont input').map(function(i,e){
				return jQuery(e).val();
			});
			
			Iam.container.find('thead tr:not(:first-child), tbody tr:not(:last-child)').each(function(i,elem){
				jQuery(elem).children('td').eq(colID).html(data[i]);
			});
			
			Iam.jtColModal.modal('hide');

		});
	}
	
	this.deleteRows = function (){
		var currentRow = this.jtModal.attr('data-jt-row-editting');
		if(currentRow == 1){alert("Sorry, you cannot remove the header.");return;}		
		this.container.find('tr').eq(currentRow).remove();
		this.rowCount--;
		this.recountRows();
		this.jtModal.modal('hide');
	}
	
	this.deleteCols = function (){
		var currentCol = this.jtColModal.attr('data-jt-col-editting');
		this.container.find('thead tr, tbody tr:not(:last-child)').each(function(i,e){
			jQuery(e).children('td').eq(currentCol).remove();
		});		
		this.colCount--;
		this.reorderCols();
		this.jtColModal.modal('hide');
	}
	
	this.handleTDDelete = function(deleteType){		
		
		
		if(deleteType === "row"){
			if(Iam.rowCount == 1){
				alert("Your table must consist of at least one row.");
				return;
			}
			Iam.deleteRows();
		}
		
		else if(deleteType === "col"){
			if(Iam.colCount == 1){
				alert("Your table must consist of at least one column.");
				return;
			}
			Iam.deleteCols();
		}
		
		
	}
	
	this.recountRows = function(){
		this.container.find('.jtrt_custom_td:not(:last-child)').each(function(index,elem){
			jQuery(elem).html(index+1);
		});
	}
	
	this.reorderCols = function(){
		this.container.find('thead tr:first-child td:not(:first-child):not(:last-child)').each(function(i,elem){
			jQuery(elem).html(Iam.alpC[i]);
		});
	}
	
	this.handleCSVImport = function(elem){
		var csvFile = jQuery(elem)[0].files[0];
		
		Papa.parse(csvFile, {
			complete: function(results) {
				if(results.errors.length > 0){
					alert(results.errors);
					return;
				}
				Iam.container.find('thead tr:nth-child(2)').remove();
				Iam.container.find('thead tr td:not(:last-child):not(:first-child)').remove();
				Iam.container.find('tbody tr:not(:last-child)').remove();
				Iam.rowCount = 0;
				Iam.colCount = 0;
				for(var t = 0; t < results.data[1].length; t++){
					Iam.addCols(results.data,t);
				}
				for(var i = 0; i < results.data.length - 1; i++){
					Iam.addRows(results.data,i);
				}			
				Iam.enable_jtcolSorting();
				Iam.jtLoader('hide');
			}
		});
	}
	
	this.returnCleanTable = function(){
		var currentHtml = this.container.clone();
		currentHtml.find('thead tr:first-child').remove();
		currentHtml.find('tbody tr td:first-child').remove();
		currentHtml.find('tr:last-child').remove();
		return currentHtml;
	}
	
	
	this.handleModalRowSave();


	// ****
	// **** Table Sorting Functionality
	// **** Credits to johnny https://johnny.github.io/jquery-sortable/
	// ****

	// $('.jtrt_table_creator').sortable({
	// 	containerSelector: 'table',
	// 	itemPath: '> tbody',
	// 	itemSelector: 'tr:not(:last-child)',
	// 	exclude: '.jtrt_custom_td',
	// 	placeholder: '<tr class="placeholder"/>',
	// 	onDrop: function  ($item, container, _super) {
	// 		jtTables.recountRows();
	// 		$item.removeClass('moving');
	// 	},
	// 	onDragStart: function ($item, container, _super) {
	// 		$item.addClass('moving');
	// 	}
	// });

	this.enable_jtcolSorting = function(){
		var oldIndex;
		jQuery('tr.sorted_head').sortable({
		containerSelector: 'tr',
		itemSelector: 'td:not(:first-child)',
		placeholder: '<td class="placeholder"/>',
		vertical: false,
		exclude: '.jtrt_custom_td',
		onDragStart: function ($item, container, _super) {
			oldIndex = $item.index();
			$item.appendTo($item.parent());
			_super($item, container);
		},
		onDrop: function  ($item, container, _super) {
			var field,
				newIndex = $item.index();
			if(newIndex == 0){
				return;
			}
			if(newIndex != oldIndex) {
			$item.closest('table').find('tbody tr').each(function (i, row) {
				row = jQuery(row);
				if(newIndex < oldIndex) {
				row.children().eq(newIndex).before(row.children()[oldIndex]);
				} else if (newIndex > oldIndex) {
				row.children().eq(newIndex).after(row.children()[oldIndex]);
				}
			});
			}

			_super($item, container);
		}
		});
	}

	this.enable_jtcolSorting();

	this.updateDefaultSortColsSelect = function(){

		var selectb = jQuery("select#jtrt_table_allow_sorting_default_col");
			selectb.find('option').remove();
		
		this.container.find("thead tr.sorted_head td:not(:first-child)").map(function(v,item){
			selectb.append("<option name='"+ item.innerText +"' value='"+ v +"'>"+ item.innerText +"</option>");
		});	

	}
	

} // end of tables class