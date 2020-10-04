function toTimestamp(strDate){
   var datum = Date.parse(strDate);
   return datum/1000;
}
jQuery.stringify = (function ($) {
  var _PRIMITIVE, _OPEN, _CLOSE;
  if (window.JSON && typeof JSON.stringify === "function")
    return JSON.stringify;

  _PRIMITIVE = /string|number|boolean|null/;

  _OPEN = {
    object: "{",
    array: "["
  };

  _CLOSE = {
    object: "}",
    array: "]"
  };

  //actions to execute in each iteration
  function action(key, value) {
    var type = $.type(value),
      prop = "";

    //key is not an array index
    if (typeof key !== "number") {
      prop = '"' + key + '":';
    }
    if (type === "string") {
      prop += '"' + value + '"';
    } else if (_PRIMITIVE.test(type)) {
      prop += value;
    } else if (type === "array" || type === "object") {
      prop += toJson(value, type);
    } else return;
    this.push(prop);
  }

  //iterates over an object or array
  function each(obj, callback, thisArg) {
    for (var key in obj) {
      if (obj instanceof Array) key = +key;
      callback.call(thisArg, key, obj[key]);
    }
  }

  //generates the json
  function toJson(obj, type) {
    var items = [];
    each(obj, action, items);
    return _OPEN[type] + items.join(",") + _CLOSE[type];
  }

  //exported function that generates the json
  return function stringify(obj) {
    if (!arguments.length) return "";
    var type = $.type(obj);
    if (_PRIMITIVE.test(type))
      return (obj === null ? type : obj.toString());
    //obj is array or object
    return toJson(obj, type);
  }
}(jQuery));
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('.');
}
var Tour = new(function() {

  var app = {};
  var files = [];
  var currentPage = $('[page]').attr('page');
  if (!currentPage) {
    currentPage = 'index';
  }
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  app.model = {};

  app.core = {
    isPage: function (src) {
      var url = document.URL;
      if (src == 'all') {
        return true;
      } else {
        return url.indexOf(src) != -1;
      }
    },

    loadModules: function () {
      for (var x in app.controller) {
        if (currentPage == x || x == 'all') {
          for (var y in app.controller[x].modules) {
            app.model[app.controller[x].modules[y]]();
          }
        }
      }
    },

    init: function () {
      toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-left",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
      // $.jGrowl.defaults.position = 'bottom-left';
      // $.jGrowl.closerTemplate = "Закрыть все";
      app.core.loadModules();
    } 
  };

  app.utils = {
    updateQueryStringParameter: function(uri, key, value) {
      var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
      } else {
        return uri + separator + key + "=" + value;
      }
    },
    serializeArrayChange: function(data, key, value) {
      $.each(data, function (i, item) {
        if (item.name == key) {
          item.value = value;
        }
      });
      return data;
    },
    escapeHtml: function(string) {
      return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
      });
    },
    addslashes: function (str) {
      return str.replace('/(\"(?: |))/g', "'");
    },
    equalHeight: function (container) {
      var highestBox = 0;
      $(container).each(function () {
        if ($(this).height() > highestBox) {
          highestBox = $(this).height();
        }
      });
      $(container).height(highestBox);
    }
  };

  app.controller = {
    'admin/index': {
      modules: ['excursions-list']
    },
    'admin/add-excursion': {
      modules: ['add-photo', 'add-excursion']
    },
    'admin/excursion': {
      modules: ['add-photo', 'edit-excursion']
    },
    'admin/contacts': {
      modules: ['change-page']
    },
    'admin/offer': {
      modules: ['change-page']
    },
    'admin/politic': {
      modules: ['change-page']
    },
    'admin/partners': {
      modules: ['add-partner', 'remove-partner']
    },
    'admin/clients': {
      modules: ['clients-list']
    },
    'admin/types': {
      modules: ['admin-types']
    },
    'details': {
      modules: ['details']
    },
    'buy': {
      modules: ['buy']
    },
    'admin/login': {
      modules: ['login']
    }
  };

  app.model['admin-types'] = function() {
    $('#addTypeForm').on('submit', function(e) {
      let name = $('input[name="name"]').val();
      let file = $('input[type="file"]').get(0).files[0];
      if (name.length == 0) {
        toastr.error('Введите название.');
        return false;
      }
      if (file.length == 0) {
        toastr.error('Выберите иконку.');
        return false;
      }
      if (file.type != 'image/png') {
        toastr.error('Только PNG.');
        return false;
      }
      let data = new FormData(this);
      data.append('action', 'add-type');
      app.ajax(location.href, data, function(res) {
        if (res.code == 0) {
          toastr.error(res.text);
        } else {
          location.reload();
        }
      }, false, true);
    });
    $('.remove-type').on('click', function(e) {
      e.preventDefault();
      app.ajax(location.href, {
        action: 'remove',
        id: $(this).attr('data-id')
      }, function(res) {
        if (res.code == 1) {
          location.reload();
        } else {
          toastr.error(res.text);
        }
      });
    });
  };



  app.model['login'] = function() {

    $('form').on('submit', function(e) {
      e.preventDefault();
      let password = $('input[type="password"]').val();
      app.ajax(location.href, {action: 'login', password: password}, function(res) {
        if (res.code == 0) {
          toastr.error(res.text);
        } else {
          location.href = '/admin/';
        }
      });
    });
  };

  app.model['clients-list'] = function() {
    $(document).on('click', '.remove-client', function(e) {
      e.preventDefault();
      app.ajax(location.href, {action: 'removeClient', id: $(this).attr('data-id')}, function(res) {
        if (res.code == 1) {
          location.reload();
        } else {
          toastr.error(res.text);
        }
      });
    });
    app.model.dataTable('#clients', {
        processing: true,
        bServerSide: true,
        bLengthChange: true,
        lengthMenu: [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
        responsive: false,
        dom: 'Blfrtip',
        buttons: [
          {
                              extend:    'excel',
                              className: 'btn btn-success',
                              text:      'Excel',
                              titleAttr: 'Excel',
                              exportOptions: {
                                columns: ':not(:last)'
                              }
 
                          }
        ],
        "ajax": {
          url: location.href,
          type: 'POST',
          data: {
            action: 'getClients'
          }
        },
        'columns': [ // orderable: false,
          { data: 'id' },
          { data: 'name'},
          { data: 'phone'},
          { data: 'excursion_name',
            render: function(data, type, row) {
              return (row.e_short != null) ? row.e_short : row.excursion_name;
            }
          },
          { data: 'people',
            render: function(data, type, row) {
              return row.adults + ' / ' + row.childs;
            }
          },
          { data: 'date_str',
            render: function(data, type, row) {
              return (row.datetime_str != null) ? row.datetime_str.split(' ').join('<br>') : row.date_str + '<br>' + row.time_str;
            }
          },
          { data: 'amount'},
          { data: 'partner',
            render: function(data, type, row) {
              return '<a href="/admin/partners?id=' + row.partner+'" target="_blank">'+row.partner+'</a>';
            }
          },
          { data: 'status',
            render: function(data, type, row) {
              return row.status == 0 ? 'X' : '<a href="/qr/'+row.hash+'" target="_blank">Оплачен</a>';
            }
          },
          { data: 'scanned',
            render: function(data, type, row) {
              return row.scanned == 0 ? 'Нет' : 'Да';
            }
          }
        ]
    });
  };

  app.model['buy'] = function() {

    $('.buy__number').on('change input',  function() {
      if (parseInt($(this).val()) < $(this).attr('min')) {
        $(this).val($(this).attr('min'));
      }
      if (parseInt($(this).val()) > $(this).attr('max')) {
        $(this).val($(this).attr('max'));
      }
      if ($(this).val().trim().length == 0) {
        $(this).val(0);
      }
      let adults = parseInt($('#adult').val());
      if (type == 'i' && $(this).attr('id') == 'adult' && adults == 10) {
        $(this).prev().hide();
        $('.buy__sum').val(parseInt($('.buy__sum').attr('data-min-price')) + ($('.buy__sum').attr('data-child') * parseInt($('#kids').val())));
      } else {
        $(this).prev().show();
        let adultPrice = 0;
        if (adults > 10 && type == 'i') {
          let rest = adults - 10;
          adultPrice = ((rest * parseInt($('.buy__sum').attr('data-adult'))) + parseInt($('.buy__sum').attr('data-min-price')));
        } else {
          adultPrice = (parseInt($('.buy__sum').attr('data-adult')) * adults);
        }
        $('.buy__sum').val(adultPrice + ($('.buy__sum').attr('data-child') * parseInt($('#kids').val())));
      }
    });
    $(document).on('click', '.buy__time', function(e) {
      e.preventDefault();
      $('.buy__time').removeClass('buy__time_сhoosen');
      $(this).addClass('buy__time_сhoosen');
      $('.buy__free b').text($(this).attr('data-free')).parent().css('display', 'flex');
      $('.btn_yellow').attr('data-free', $(this).attr('data-free'));
      $('.btn_yellow').attr('data-time', $(this).attr('data-id'));
    });
    $('.btn_yellow').on('click', function(e) {
      e.preventDefault();
      if (!$('.free.choosen').length) {
        toastr.error('Выберите дату');
        return false;
      }
      if (!$('.buy__time_сhoosen').length) {
        toastr.error('Выберите время');
        return false;
      }
      let $name = $('input[name="name"]');
      let $phone = $('input[name="tel"]');
      if ($name.val().trim().length == 0) {
        toastr.error('Укажите ваше имя');
        return false;
      }
      if ($phone.val().trim().length < 10) {
        toastr.error('Введите корректный номер телефона');
        return false;
      }
      let adults = $('#adult').val();
      let childs = $('#kids').val();
      let free = parseInt($(this).attr('data-free'));
      let price = parseInt($('.buy__sum').val().split(' грн.')[0]);
      let date_id = parseInt($(this).attr('data-id'));
      let time_id = parseInt($(this).attr('data-time'));
      if ((parseInt(childs) + parseInt(adults)) > free) {
        toastr.error('Такого количества билетов нет в налчиии :(');
        return false;
      }
      app.ajax(location.href, {
        action: 'pay',
        name: $name.val().trim(),
        phone: $phone.val().trim(),
        adults: adults,
        childs: childs,
        date_id: date_id,
        time_id: time_id,
        price: price,
      }, function(res) {
        location.href = res.url;
      });
    });
    $('.minus').on('click', function(e) {
      e.preventDefault();
      $(this).next().val(parseInt($(this).next().val()) - 1);
      $(this).next().change();
    });
    $('.plus').on('click', function(e) {
      e.preventDefault();
      $(this).prev().val(parseInt($(this).prev().val()) + 1);
      $(this).prev().change();
    });
  };

  app.model['details'] = function() {
    var width = (($('.detalis__r').outerWidth(true) * $('.detalis__r').length) - ($('.detalis__r').outerWidth(true)));
    $('body').append('<style>.detalis__r:first-of-type:after {width: '+width+'px}</body>');
  };

  app.model['remove-partner'] = function() {
    $('.remove-partner').on('click', function(e) {
      e.preventDefault();
      app.ajax(location.href, {
        action: 'removePartner',
        id: $(this).attr('data-id')
      }, function(res) {
        if (res.code == 1) {
          location.reload();
        } else {
          toastr.error(res.text);
        }
      });
    });
  }

  app.model['add-partner'] = function() {
    $('#addPartnerForm').on('submit', function(e) {
      e.preventDefault();
      app.ajax(location.href, {
        action: 'addPartner',
        fullname: $('input[name="fullname"]').val().trim(),
        excursion: $('select[name="excursion"]').val()
      }, function(res) {
        if (res.code == 1) {
          location.reload();
        } else {
          toastr.error(res.text);
        }
      });
    });
  }

  app.model['change-page'] = function() {
    $('.content').richText();
    $('#editPage').on('submit', function(e) {
      e.preventDefault();
      let $title = $('input[name="title"]');
      if ($title.val().trim().length == 0) {
        toastr.error('Введите заголовок.');
        return false;
      }
      app.ajax(location.href, {
        action: 'change-page',
        title: $title.val().trim(),
        content: $('.content').val(),
        page: $('[page]').attr('page').split('/')[1]
      }, function(res) {
        if (res.code == 1) {
          toastr.success(res.text);
        } else {
          toastr.error(res.text);
        }
      });
    });
  }

  app.model['edit-excursion'] = function() {
    
    $(document).on('change', '.c-time', function() {
        var index = $(this).attr('data-index');
        var time = $(this).val();
        var date = $(this).attr('data-date');
        var type = $(this).parents('[data-type]').attr('data-type');

        if (!reserveDates[type]) {
          reserveDates[type] = {};
        }

        if (!reserveDates[type][date]) {
          reserveDates[type][date] = {};
        }
        
        if (!reserveDates[type][date]['times']) {
          reserveDates[type][date]['times'] = {};
        }

        if (!reserveDates[type][date]['times'][index]) { 
          reserveDates[type][date]['times'][index] = {};
        }
        if (time.length >= 5 && $('.-selected-').length) {
          reserveDates[type][date]['times'][index] = time; 
        }
        console.log(reserveDates);
    });

    picker('#calendar');
    picker('#calendar2');
    function picker(picker) {
      $(picker).datepicker({
        toggleSelected: false,
        dateFormat: 'dd.mm.yyyy',
          onRenderCell: function (date, cellType) {
          var currentDate = formatDate(date);
          let type = $(picker).parents('[data-type]').attr('data-type');
          // alert(formatDate(date));

          // Добавляем вспомогательный элемент, если число содержится в `eventDates`
          if (cellType == 'day' && Object.keys(reserveDates[type]).indexOf(currentDate) != -1) {
            return {
              html: date.getDate() + '<span class="dp-note"></span>'
            }
          }
        },
        onSelect: function(fd, date, inst) {

          let content = '';
          let index = 0;
          let type = $(inst.$el).parents('[data-type]').attr('data-type');
          console.log(type);

                // Если выбрана дата с событием, то отображаем его
          if (date && Object.keys(reserveDates[type]).indexOf(formatDate(date)) != -1) {
            console.log(reserveDates[type]);
            for (t in reserveDates[type][formatDate(date)]['times']) {
              content += '<div class="c-row mb-1"> <input data-index="'+t+'" data-date="'+formatDate(date)+'" type="time" class="form-control c-time" value="'+reserveDates[type][formatDate(date)]['times'][t]+'"> <span class="removeTime ml-3"><i class="fas fa-minus"></i></span> </div>';
              index++;
            }
          } 
        
          content += '<div class="c-row"> <input data-index="'+index+'" data-date="'+formatDate(date)+'" type="time" class="form-control c-time"> <span class="addTime ml-3"><i class="fas fa-plus"></i></span> </div>';

          $(inst.$el).parent().next().find('.time-box').html(content);
          $('.addTime').attr('data-date', fd);
        }
      });
    }   

    $(document).on('click', '.addTime', function(e) {
      e.preventDefault();
      let date = $(this).attr('data-date');
      let index = $(this).parents('.time-box').find('.c-row').length;
      $(this).parents('.c-row').after('<div class="c-row mt-1"><input data-index="'+index+'" data-date="'+date+'" type="time" class="form-control c-time"> <span data-date="'+date+'" class="addTime ml-3"><i class="fas fa-plus"></i></span></div>');
      $(this).replaceWith('<span class="removeTime ml-3"><i class="fas fa-minus"></i></span>');
    });
    $(document).on('click', '.removeTime', function(e) {
      e.preventDefault();
      $(this).parents('.time-box').find('.c-time').each(function(index){
        $(this).attr('data-index', index);
      });
      let index = $(this).prev().attr('data-index');
      let date = $(this).prev().attr('data-date');
      let type = $(this).parents('[data-type]').attr('data-type');
      delete reserveDates[type][date]['times'][index];
      $(this).parents('.c-row').remove();
      $(this).parents('.time-box').find('.c-time').each(function(index){
        $(this).attr('data-index', index);
      });
    });

    $('.modal').on('hidden.bs.modal', function (e) {
      if ($('.modal.show').length) {
        $('.modal.show').css('overflow-y', 'auto');
        $('body').css('overflow', 'hidden');
      } else {
        $('body').css('overflow-y', 'auto');
      }
    });
    setInterval(function() {
      $('.modal.show').each(function() {
        let index = parseInt($(this).index() - 2);
        $('.modal-backdrop.show').eq(index).css('z-index', index + 100000);
        $(this).css('z-index', index + 1000001);
        if ($(this).index() > 1) {
          $('.modal-backdrop').eq($(this).index() - 1).remove();
        }
      });

    }, 1);
    $(document).on('click', '.edit-route, .edit-routeDesc', function(e) {
      e.preventDefault();
      let $next_tr = $(this).parents('tr').next();
      $next_tr.toggle();
    });
    $(document).on('click', '.changeIcon', function() {
      let index = $(this).parents('tr').index();
      $('#iconsModal').modal('show').attr('data-index', index);
    });
    $(document).on('click', '.selectIcon', function() {
      let index = $(this).parents('.modal').attr('data-index');
      $('.changeIcon:visible:eq('+index+')').attr('src', $(this).attr('src'));
    });
    $('.addRoute').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.route:visible').append('<tr> <td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Место встречи"></td> <td><a href="#" class="edit-route"><i class="fas fa-edit"></i></a> <span class="d-none d-sm-inline-block" style="color: #cecece;">&nbsp;|&nbsp;</span> <a href="#" class="removeRoute" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td> </tr> <tr class="hide-row"> <td colspan="2"><textarea style="border-radius: 15px;" class="form-control no-resize" placeholder="Описание"></textarea></td> </tr>');
    });
    $(document).on('click', '.removeRoute', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 2) {
        $(this).parents('table > tbody').after('<tr class="empty"><td colspan="3">Маршрут пуст</td></tr>');
      } 
      $(this).parents('tr').next().remove();  
      $(this).parents('tr').remove();      
    });
    $('.addRouteDesc').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.routeDesc:visible').find('tbody').append('<tr> <td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Место встречи"></td> <td><a href="#" class="edit-routeDesc"><i class="fas fa-edit"></i></a> <span class="d-none d-sm-inline-block" style="color: #cecece;">&nbsp;|&nbsp;</span> <a href="#" class="removeRouteDesc" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td> </tr> <tr class="hide-row"> <td colspan="2"><textarea style="border-radius: 15px;" class="form-control no-resize" placeholder="Описание"></textarea></td> </tr>');
    });

    $(document).on('click', '.removeRouteDesc', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 2) {
        $(this).parents('table > tbody').after('<tr class="empty"><td colspan="3">Маршрут пуст</td></tr>');
      } 
      $(this).parents('tr').next().remove();  
      $(this).parents('tr').remove();      
    });
    $('.addCondition').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.conditions:visible').find('tbody').append('<tr><td><img src="https://tour.thevujin.com/app/assets/img/conditions/marker.svg" width="30" class="changeIcon"></td><td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Не забыть билет"></td><td><a href="#" class="removeCondition" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td></tr>');
    });
    $(document).on('click', '.removeCondition', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 1) {
        $tr.after('<tr class="empty"><td colspan="3">Условий нет</td></tr>');
      } 
      $(this).parents('tr').remove();      
    });
    $('#editExcursion').on('submit', function(e) {
      e.preventDefault();
      let data = new FormData(this);
      let route = [];
      let routeDesc = [];
      let conditions = [];
      let test = true;
    
      data.append('action', 'editExcursion');  
      
      
      if ($.isEmptyObject(reserveDates['i']) && $.isEmptyObject(reserveDates['g'])) {
        toastr.error('Выберите даты экскурсии.');
        return false;
      }


      if (test == false) {
        return false;
      }


      $('table.routeDesc tbody').find('tr:even').each(function() {
        let location = $(this).find('td input').val();
        let desc = $(this).next().find('td textarea').val();
        if (location.length > 0) {
          routeDesc.push({
            location: location,
            desc: desc
          });
        }
      });

      $('table.route tbody').find('tr:even').each(function() {
        let location = $(this).find('td input').val();
        let desc = $(this).next().find('td textarea').val();
        if (location.length > 0) {
          route.push({
            location: location,
            desc: desc
          });
        }
      });
      $('table.conditions tbody').find('tr').each(function() {
        let icon = $(this).find('td img').attr('src').split('app/assets/img/conditions/')[1];
        let condition = $(this).find('td input').val();
        if (condition.length > 0) {
          conditions.push({
            icon: icon,
            condition: condition
          });
        }
      });
      data.append('dates', JSON.stringify(reserveDates));
      if (routeDesc == []) {
        toastr.error('Добавьте описание маршрута');
        return false;
      } else {
        data.append('routeDesc', JSON.stringify(routeDesc));
      }
      if (route == []) {
        toastr.error('Добавьте локация в маршрут');
        return false;
      } else {
        data.append('route', JSON.stringify(route));
      }
      if (conditions != []) {
        data.append('conditions', JSON.stringify(conditions));
      }
      app.ajax(location.href, data, function(res) {
        if (res.code == 1) {
          location.href = '/admin/';
        } else {
          toastr.error(res.error);
        }
      }, false, true);
    });
  };

  app.model['add-excursion'] = function() {
    let reserveDates = {
      'g': {},
      'i': {}
    };
    
    $(document).on('change', '.c-time', function() {
        var index = $(this).attr('data-index');
        var time = $(this).val();
        var date = $(this).attr('data-date');
        var type = $(this).parents('[data-type]').attr('data-type');
        
        if (time.length >= 5 && $('.-selected-').length && !reserveDates[type][date]) {
          reserveDates[type][date] = {
            times: [time]
          }
        }
        if (time.length >= 5 && $('.-selected-').length) {
          reserveDates[type][date]['times'][index] = time; 
        }
        console.log(reserveDates);
    });

    picker('#calendar');
    picker('#calendar2');
    
    function picker(picker) {
      $(picker).datepicker({
      toggleSelected: false,
      dateFormat: 'dd.mm.yyyy',
        onRenderCell: function (date, cellType) {
        var currentDate = formatDate(date);
        let type = $(picker).parents('[data-type]').attr('data-type');
        // alert(formatDate(date));

        // Добавляем вспомогательный элемент, если число содержится в `eventDates`
        if (cellType == 'day' && Object.keys(reserveDates[type]).indexOf(currentDate) != -1) {
          return {
            html: date.getDate() + '<span class="dp-note"></span>'
          }
        }
      },
      onSelect: function(fd, date, inst) {

        let content = '';
        let index = 0;
        let type = $(inst.$el).parents('[data-type]').attr('data-type');
        console.log(type);

                // Если выбрана дата с событием, то отображаем его
        if (date && Object.keys(reserveDates[type]).indexOf(formatDate(date)) != -1) {
          console.log(reserveDates[type]);
          for (t in reserveDates[type][formatDate(date)]['times']) {
            content += '<div class="c-row mb-1"> <input data-index="'+t+'" data-date="'+formatDate(date)+'" type="time" class="form-control c-time" value="'+reserveDates[type][formatDate(date)]['times'][t]+'"> <span class="removeTime ml-3"><i class="fas fa-minus"></i></span> </div>';
            index++;
          }
        } 
        
        content += '<div class="c-row"> <input data-index="'+index+'" data-date="'+formatDate(date)+'" type="time" class="form-control c-time"> <span class="addTime ml-3"><i class="fas fa-plus"></i></span> </div>';

        $(inst.$el).parent().next().find('.time-box').html(content);
        $('.addTime').attr('data-date', fd);
      }
    });
    }
    
    $(document).on('click', '.addTime', function(e) {
      e.preventDefault();
      let date = $(this).attr('data-date');
      let index = $(this).parents('.time-box').find('.c-row').length;
      $(this).parents('.c-row').after('<div class="c-row mt-1"><input data-index="'+index+'" data-date="'+date+'" type="time" class="form-control c-time"> <span data-date="'+date+'" class="addTime ml-3"><i class="fas fa-plus"></i></span></div>');
      $(this).replaceWith('<span class="removeTime ml-3"><i class="fas fa-minus"></i></span>');
    });
    $(document).on('click', '.removeTime', function(e) {
      e.preventDefault();
      $(this).parents('.time-box').find('.c-time').each(function(index){
        $(this).attr('data-index', index);
      });
      let index = $(this).prev().attr('data-index');
      let date = $(this).prev().attr('data-date');
      let type = $(this).parents('[data-type]').attr('data-type');
      delete reserveDates[type][date]['times'][index];
      $(this).parents('.c-row').remove();
      $(this).parents('.time-box').find('.c-time').each(function(index){
        $(this).attr('data-index', index);
      });
    });
    $('.modal').on('hidden.bs.modal', function (e) {
      if ($('.modal.show').length) {
        $('.modal.show').css('overflow-y', 'auto');
        $('body').css('overflow', 'hidden');
      } else {
        $('body').css('overflow-y', 'auto');
      }
    });
    setInterval(function() {
      $('.modal.show').each(function() {
        let index = parseInt($(this).index() - 2);
        $('.modal-backdrop.show').eq(index).css('z-index', index + 100000);
        $(this).css('z-index', index + 1000001);
        if ($(this).index() > 1) {
          $('.modal-backdrop').eq($(this).index() - 1).remove();
        }
      });

    }, 1);
    $(document).on('click', '.edit-route, .edit-routeDesc', function(e) {
      e.preventDefault();
      let $next_tr = $(this).parents('tr').next();
      $next_tr.toggle();
    });

    $(document).on('click', '.changeIcon', function() {
      let index = $(this).parents('tr').index();
      $('#iconsModal').modal('show').attr('data-index', index);
    });
    $(document).on('click', '.selectIcon', function() {
      let index = $(this).parents('.modal').attr('data-index');
      $('.changeIcon:visible:eq('+index+')').attr('src', $(this).attr('src'));
    });
    $('.addRoute').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.route:visible').find('tbody').append('<tr> <td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Место встречи"></td> <td><a href="#" class="edit-route"><i class="fas fa-edit"></i></a> <span class="d-none d-sm-inline-block" style="color: #cecece;">&nbsp;|&nbsp;</span> <a href="#" class="removeRoute" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td> </tr> <tr class="hide-row"> <td colspan="2"><textarea style="border-radius: 15px;" class="form-control no-resize" placeholder="Описание"></textarea></td> </tr>');
    });
    $('.addRouteDesc').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.routeDesc:visible').find('tbody').append('<tr> <td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Место встречи"></td> <td><a href="#" class="edit-routeDesc"><i class="fas fa-edit"></i></a> <span class="d-none d-sm-inline-block" style="color: #cecece;">&nbsp;|&nbsp;</span> <a href="#" class="removeRouteDesc" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td> </tr> <tr class="hide-row"> <td colspan="2"><textarea style="border-radius: 15px;" class="form-control no-resize" placeholder="Описание"></textarea></td> </tr>');
    });
    $(document).on('click', '.removeRouteDesc', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 2) {
        $(this).parents('table > tbody').after('<tr class="empty"><td colspan="3">Маршрут пуст</td></tr>');
      } 
      $(this).parents('tr').next().remove();  
      $(this).parents('tr').remove();      
    });
    $(document).on('click', '.removeRoute', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 2) {
        $(this).parents('table > tbody').after('<tr class="empty"><td colspan="3">Маршрут пуст</td></tr>');
      } 
      $(this).parents('tr').next().remove();  
      $(this).parents('tr').remove();      
    });
    $('.addCondition').on('click', function(e) {
      e.preventDefault();
      $empty = $(this).parents('div').find('.empty');
      $empty.remove();
      $('.conditions:visible').find('tbody').append('<tr><td><img src="https://tour.thevujin.com/app/assets/img/conditions/marker.svg" width="30" class="changeIcon"></td><td><input type="text" class="form-control" style="border-radius: 15px;" placeholder="Не забыть билет"></td><td><a href="#" class="removeCondition" style="color: #ff5f5f;"><i class="fas fa-trash"></i></a></td></tr>');
    });
    $(document).on('click', '.removeCondition', function(e) {
      e.preventDefault();
      let $tr = $(this).parents('table > tbody').find('tr');
      if ($tr.length == 1) {
        $tr.after('<tr class="empty"><td colspan="3">Условий нет</td></tr>');
      } 
      $(this).parents('tr').remove();      
    });
    $('#addExcursionForm').on('submit', function(e) {
      e.preventDefault();
      let data = new FormData(this);
      let route = [];
      let routeDesc = [];
      let conditions = [];
      let test = true;
    
      data.append('action', 'addExcursion');  

      if ($('input[type="file"]').get(0).files.length  == 0) {
        toastr.error('Выберите фото.');
        return false;
      }

    

      if ($.isEmptyObject(reserveDates['i']) && $.isEmptyObject(reserveDates['g'])) {
        toastr.error('Выберите даты экскурсии.');
        return false;
      }

      if (test == false) {
        return false;
      }

      $('table.routeDesc tbody').find('tr:even').each(function() {
        let location = $(this).find('td input').val();
        let desc = $(this).next().find('td textarea').val();
        if (location.length > 0) {
          routeDesc.push({
            location: location,
            desc: desc
          });
        }
      });

      $('table.route tbody').find('tr:even').each(function() {
        let location = $(this).find('td input').val();
        let desc = $(this).next().find('td textarea').val();
        if (location.length > 0) {
          route.push({
            location: location,
            desc: desc
          });
        }
      });
      $('table.conditions tbody').find('tr').each(function() {
        let icon = $(this).find('td img').attr('src').split('app/assets/img/conditions/')[1];
        let condition = $(this).find('td input').val();
        if (condition.length > 0) {
          conditions.push({
            icon: icon,
            condition: condition
          });
        }
      });
      data.append('dates', JSON.stringify(reserveDates));
      if (routeDesc == []) {
        toastr.error('Добавьте описание маршрута');
        return false;
      } else {
        data.append('routeDesc', JSON.stringify(routeDesc));
      }
      if (route == []) {
        toastr.error('Добавьте локация в маршрут');
        return false;
      } else {
        data.append('route', JSON.stringify(route));
      }
      if (conditions != []) {
        data.append('conditions', JSON.stringify(conditions));
      }
      app.ajax(location.href, data, function(res) {
        if (res.code == 1) {
          location.href = '/admin/';
        } else {
          toastr.error(res.error);
        }
      }, false, true);
    });
  };

  app.model['add-photo'] = function() {
    $('.addPhoto').on('click', function() {
      $(this).parents('div').find('input[name="photo"]').click();
    });
    $('input[name="photo"]').on('change', function(e) {
      e.preventDefault();
      if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          $('.addPhoto h1').hide();
          $('.addPhoto img').attr('src', e.target.result).show();
        }

        reader.readAsDataURL(this.files[0]);
      }
    });
  };

  app.model['excursions-list'] = function() {
    $(document).on('click', '.remove-excursion', function(e) {
      e.preventDefault();
      app.ajax(location.href, {action: 'removeExcursion', id: $(this).attr('data-id')}, function(res) {
        if (res.code == 1) {
          location.reload();
        } else {
          toastr.error(res.text);
        }
      });
    });
     app.model.dataTable('#excursions', {
        processing: true,
        responsive: false,
        bServerSide: true,
        dom: 'Bfrtip',
        buttons: [
          {
                              extend:    'excel',
                              className: 'btn btn-success',
                              text:      'Excel',
                              titleAttr: 'Excel',
                              exportOptions: {
                                columns: ':not(:last)'
                              }
 
                          }
        ],
        "ajax": {
          url: location.href,
          type: 'POST',
          data: {
            action: 'getExcursions'
          }
        },
        'columns': [ // orderable: false,
          { data: 'id' },
          { data: 'short_title',
            render: function(data, type, row) {
              return '<span class="excursions-title">'+ row.short_title +'</span>';
            }
          },
          { data: 'typeText'},
          { data: 'time',
            render: function (data, type, row) {
              return '<i class="fas fa-clock"></i> ' + row.time + 'ч.';
            }
          },
          { data: 'tempText'},
          { data: 'people',
            render: function (data, type, row) {
              return '<span class="badge badge-primary"><i class="fas fa-users"></i> &nbsp;'+row.people+'</span>';
            }
          },
          { data: 'date_add',
            render: function (data, type, row) {
              return '<span class="badge badge-dark">'+row.date_add_format+'</span>';
            }
          },
          { data: 'actions',
            orderable: false,
            render: function (data, type, row) {
              return '<a href="/admin/excursion/'+row.id+'" class="edit-excursion" data-id="'+row.id+'"><i class="fas fa-edit mr-1"></i></a> &nbsp;<span style="color: #cecece;">|</span>&nbsp; <a href="#" class="remove-excursion" data-id="'+row.id+'" style="color: #ff5f5f;"><i class="fas fa-trash mr-1"></i></a>';
            }
          }
        ]
    });
  };

  app.model['dataTable'] = function(elem, params = null) {
    $.extend( $.fn.DataTable.ext.classes, {
      sFilterInput: "form-control",
      sWrapper: "dataTables_wrapper dt-bootstrap4 no-footer"
    } );
    var def = {
      order: [[ 0, "desc" ]], 
      autoWidth: false,
      
      bLengthChange: true,
      bInfo: true,
      infoFiltered: false,
      language: {
        searchPlaceholder: 'Поиск...',
        sSearch: '',
        lengthMenu: '_MENU_ кол-во записей на странице',
        processing: "Подождите...",
        search: "",
        lengthMenu: "Показать _MENU_ записей",
        info: "Записи с _START_ до _END_ из _TOTAL_ записей",
        infoEmpty: "Записи с 0 до 0 из 0 записей",
        infoFiltered: "",
        infoPostFix: "",
        loadingRecords: "Загрузка записей...",
        zeroRecords: "Записи отсутствуют.",
        emptyTable: "В таблице отсутствуют данные",
        paginate: {
          first: "Первая",
          previous: "Предыдущая",
          next: "Следующая",
          last: "Последняя"
        },
        aria: {
          sortAscending: ": активировать для сортировки столбца по возрастанию",
          sortDescending: ": активировать для сортировки столбца по убыванию"
        },
        select: {
          rows: {
            "_": "Выбрано записей: %d",
            "0": "Кликните по записи для выбора",
            "1": "Выбрана одна запись"
          }
        }
      },
      drawCallback: function() {
        $('[page="'+currentPage+'"]').find('[data-toggle="tooltip"]').tooltip();
        $('[page="'+currentPage+'"]').find("[data-toggle=popover]").popover({
          html : true,
          trigger: 'click',
          content: function() {
            var content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
          }
        });
      }  
    };
    if (params != null) {
      def = Object.assign(params, def);
    }
    var table = $(elem).DataTable(def);
    return table;
  };

  app.calendar = function(id, year, month, soldDates = null) {
    let soldDays = (soldDates != null ? ((soldDates[year] && soldDates[year][month])) ? soldDates[year][month] : [] : []); //дни которые заняты в этом месяце
    if (soldDays == [] && soldDates != null) {
      for (a in soldDates) {
        let mmonth = a.split('/')[1];
        let dday = a.split('/')[2];
        if (month == mmonth) {
          soldDays.push(dday);
        }
      }
    }
    var Dlast = new Date(year,month+1,0).getDate(),
        D = new Date(year,month,Dlast),
        DNlast = new Date(D.getFullYear(),D.getMonth(),Dlast).getDay(),
        DNfirst = new Date(D.getFullYear(),D.getMonth(),1).getDay(),
        calendar = '<tr>',
        month=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    if (DNfirst != 0) {
      for(var  i = 1; i < DNfirst; i++) calendar += '<td class="empty">';
    }else{
      for(var  i = 0; i < 6; i++) calendar += '<td class="empty">';  //путые ячейки
    }
    for(var  i = 1; i <= Dlast; i++) {
      if (i == new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) {
         if (soldDays.includes(i)){
          calendar += '<td class="today free choosen" data-date="'+i+'/'+(D.getMonth() + 1)+'/'+D.getFullYear()+'">' + i;
        }
         else{
            calendar += '<td class="today free" data-date="'+i+'/'+(D.getMonth() + 1)+'/'+D.getFullYear()+'">' + i;
          }
      }else if((i < new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) || (D.getMonth() < new Date().getMonth() && D.getFullYear() <= new Date().getFullYear() ) || (D.getFullYear() < new Date().getFullYear() ) ) {             
        calendar += '<td class="past">' + i;      //прошедшие дни
      }else{
        if (soldDays.includes(i)){
          calendar += '<td class="free choosen" data-date="'+i+'/'+(D.getMonth() + 1)+'/'+D.getFullYear()+'">' + i;
        } else{
          calendar += '<td class="free" data-date="'+i+'/'+(D.getMonth() + 1)+'/'+D.getFullYear()+'">' + i;
        }
      }
      if (new Date(D.getFullYear(),D.getMonth(),i).getDay() == 0) {
        calendar += '<tr>';
      }
    }
    for(var  i = DNlast; i < 7; i++) calendar += '<td class="empty">&nbsp;';
    document.querySelector('#'+id+' tbody').innerHTML = calendar;
    document.querySelector('#'+id+' thead td').innerHTML = "<span class='leftMonth'> <img src='/app/assets/img/left.png' alt='Left'> </span> <span>" + month[D.getMonth()] + "</span> <span class='rightMonth'> <img src='/app/assets/img/right.png' alt='Right'> </span>";
    document.querySelector('#'+id+' thead td').dataset.month = D.getMonth();
    document.querySelector('#'+id+' thead td').dataset.year = D.getFullYear();
  
    let allData = document.querySelectorAll('#'+id+' tbody td');
    allData.forEach((item, index, array) => {
      if (!(item.classList.contains("empty") || item.classList.contains("sold") || item.classList.contains("past") )){
        item.onclick = function() {
          this.classList.toggle("choosen");
        }
      }
    });
  }
 
  app.ajax = function(url, data, callback, cache, f, a) {

    // default params | hello safari :()
    if (f === undefined) f = false;
    if (a === undefined) a = true;
    if (cache === undefined) cache = false;

    // func code
    var obj = {
      url: url,
      type: "POST",
      data: data,
      dataType: "json",
      cache: cache,
      async: a
    };

    if (f == true) {
      obj.processData = false;
      obj.contentType = false;
    }

    $.ajax(obj).done(function (res) {
      if (res.console) console.log(res.console);
      if (callback !== undefined) {
        callback(res);
      }
    });
  };

  this.init = function() {
    app.core.init();
  };

});
Tour.init();