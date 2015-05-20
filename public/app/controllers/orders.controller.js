/**
 * Created by PIPON on 09.03.2015.
 */

(function(angular) {
    angular.module('app').controller('ordersController', OrdersController);

    OrdersController.$inject = ['$scope','toastsPresenter','repository','modelNames', 'print', '$q', 'utils'];
    function OrdersController($scope, toastsPresenter,repository,modelNames, print, $q, utils){

        var saleOrderDtl = [];
        $scope.saleOrders = [];

        $scope.print = printOrder;
        $scope.saveHeader = saveHeader;
        $scope.setCurrentOrder = setCurrentOrder;
        $scope.saveComments = saveComments;
        $scope.saveManagement = saveManagement;
        $scope.removeOrder = removeOrder;

        function printOrder(){
            if (!$scope.selectedOrder){
                toastsPresenter.info('Выберите заказ');
            }
            print.printOrder($scope.selectedOrder);
        };

        function removeOrder(){
            if (!$scope.selectedOrder){
                toastsPresenter.info('Выберите заказ');
            }

            var removePromises = [];

            for(var i=0; i <$scope.selectedOrder._saleOrderDtl.length; i++ )
            {
                var detail = $scope.selectedOrder._saleOrderDtl[i];
                removePromises.push(repository.removeModelItem(modelNames.SALE_ORDER_DTL, detail.id));
            }

            removePromises.push(repository.removeModelItem(modelNames.SALE_ORDER_HEADER, $scope.selectedOrder.id));
            removePromises.push(repository.removeModelItem(modelNames.SALE_ORDER, $scope.selectedOrder.id));

            $q.all(removePromises).then(function(data){
                toastsPresenter.info('Заказ удален');

                // TODO:
                var index =  utils.findIndexById($scope.saleOrders, $scope.selectedOrder.id, 'id');
                $scope.saleOrders.splice(index, 1);
                $scope.selectedOrder = {};

            }, function(error){
                toastsPresenter.error('Ошибка удаления заказа');
                console.log(error);
            });

        }

        function saveManagement(){
            var updateData = {
                isApproved: $scope.selectedOrder.isApproved,
                isCompleted: $scope.selectedOrder.isCompleted,
                deliveryCost: $scope.selectedOrder.deliveryCost
            };
            var orderId = $scope.selectedOrder.id;
            repository.updateModelItem(modelNames.SALE_ORDER, orderId, updateData).then(function(){
                toastsPresenter.info('Информация сохранена.');
            }, function(error){
                console.error('SALE_ORDER');
                console.error(error);
            });

        };

        function saveHeader(){
            var headerId = $scope.selectedOrder._saleOrderHeader.id;
            var headerData = $scope.selectedOrder._saleOrderHeader;
            // update
            repository.updateModelItem(modelNames.SALE_ORDER_HEADER, headerId,headerData).then(function(){
                toastsPresenter.info('Информация сохранена.');
            }, function(error){
                console.error('SALE_ORDER_HEADER');
                console.error(error);
            });
        }

        function saveComments(){
            var saleOrderId = $scope.selectedOrder.id;
            var commentData = {
                comment: $scope.selectedOrder.comment,
                response: $scope.selectedOrder.response
            }
            // update
            repository.updateModelItem(modelNames.SALE_ORDER, saleOrderId, commentData).then(function(){
                toastsPresenter.info('Информация сохранена.');
            }, function(error){
                console.error('SALE_ORDER');
                console.error(error);
            });
        }

        function setCurrentOrder(order){
            $scope.selectedOrder = order;
            $scope.selectedOrder._saleOrderHeader = $scope.selectedOrder._saleOrderHeader || {};
        };

        repository.reloadModelItems([modelNames.USER, modelNames.SET, modelNames.SALE_ITEM, modelNames.SALE_ITEM_DTL,
            modelNames.PRICE, modelNames.CATEGORY, modelNames.SALE_ORDER, modelNames.SALE_ORDER_DTL,
            modelNames.SALE_ORDER_HEADER]).then(function(){

            saleOrderDtl = repository.getModelItems(modelNames.SALE_ORDER_DTL);

            repository.buildModelItemData(modelNames.SALE_ORDER);

            $scope.saleOrders = repository.getModelItems(modelNames.SALE_ORDER);

        }, function (error) {
            console.log(error);
            toastsPresenter.error('Возникла при загрузке.');
        });
    }
})(angular);


