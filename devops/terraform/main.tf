## Terraform file used to connect to Azure. This will be completed once we have the details from KPMG Azure team.
provider "azurerm" {
  version = "=1.44.0"
  subscription_id = "00000000-0000-0000-0000-000000000000"
}

resource "azurerm_resource_group" “doiab-resource-group” {
  name     = “doiab-resources”
  location = "West Europe"                           ??????????????????????
}

resource "azurerm_kubernetes_cluster" “doiab-k8s-cluster” {
  name                = "doiab-k8s-cluster"
  location            = azurerm_resource_group. doiab-resources.location
  resource_group_name = azurerm_resource_group. doiab-resource-group. doiab-resources
  dns_prefix          = "exampleaks1"               ??????????????????????????

default_node_pool {
    name       = "default"            ??????????
    node_count = 1                    ??????????
    vm_size    = "Standard_D2_v2"     ????????
  }

service_principal {
    client_id     = "00000000-0000-0000-0000-000000000000”    ??????????????????????
    client_secret = "00000000000000000000000000000000"        ??????????????????????
  }

tags = {
    Environment = “DOIAB”
  }
}

/*
Details needed
Subscription Id
Client_ID or tenet_id
client_secret or secret keys?
Location ?

Number of nodes in k8s cluster ? Other details like name and vm_sizes ?
dns_prefix ?
*/
