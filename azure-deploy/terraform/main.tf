terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  default = "eastus"
}

resource "azurerm_resource_group" "azora" {
  name     = "azora-rg"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = "azoraregistry"
  resource_group_name = azurerm_resource_group.azora.name
  location            = azurerm_resource_group.azora.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "env" {
  name                = "azora-env"
  location            = azurerm_resource_group.azora.location
  resource_group_name = azurerm_resource_group.azora.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}
