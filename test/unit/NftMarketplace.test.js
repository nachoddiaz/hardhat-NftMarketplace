const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests ", function () {
          let NftMarketplace, basicNft
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              //Create that account to act like a NFT seller
              const accounts = await ethers.getSigners()
              player = accounts[1]
              await deployments.fixture(["all"])
              //Deploy the nft contract and the MP contract
              NftMarketplace = await ethers.getContract("NftMarketplace", deployer)
              basicNft = await ethers.getContract("BasicNFT", deployer)
              //Mint a NFT
              await basicNft.mintNft()
              //Approve the marketplace to hold the nft, that function is inherited from ERC721
              await basicNft.approve(NftMarketplace.address, TOKEN_ID)
          })

          it("list and can be bought", async function () {
              await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              //We want the player to be able to buy a NFT
              const playerConnceted = NftMarketplace.connect(player)
              //{value: PRICE} is needed because we need msg.sender
              await playerConnceted.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
              const newOwner = await basicNft.ownerOf(TOKEN_ID)
              assert(newOwner.toString() == player.address)
              const deployerProceeds = await NftMarketplace.getProceeds(deployer)
              assert(deployerProceeds.toString() == PRICE.toString())
          })

          describe("listItem", function () {
              it("reverts Pricemustbegreaterthanzero if price hasnt been introduced", async function () {
                  const PRICE = ethers.utils.parseEther("0")
                  await expect(
                      NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(`NftMarketplace__Pricemustbegreaterthanzero`)
              })

              it("reverts NotaprovedMPtosell if the MP hasnt been aproved to sell the NFT", async function () {
                  await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                  await expect(
                      NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(`NftMarketplace__NotaprovedMPtosell()`)
              })

              it("Fires event ItemListed when a item has been listed in the MP", async function () {
                  await expect(NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                      NftMarketplace,
                      "ItemListed"
                  )
              })

              it("only not listed NFTs can be listed", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(
                      `NftMarketplace__AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                  )
              })

              it("Only the Owner of the NFT can list it", async function () {
                  NftMarketplace = await ethers.getContract("NftMarketplace", player)
                  basicNft = await ethers.getContract("BasicNFT", player)
                  await expect(
                      NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`)
              })
          })

          describe("buyItem", function () {
              it("Cant buy if the price is not met", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      NftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: ethers.utils.parseEther("0.01"),
                      })
                  ).to.be.revertedWith(
                      `NftMarketplace__PriceNotMet("${basicNft.address}", ${TOKEN_ID}, ${PRICE})`
                  )
              })

              it("Cant buy if the NFT is not listed", async function () {
                  await expect(
                      NftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: ethers.utils.parseEther("0.01"),
                      })
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  )
              })
 
              it("transfer the NFT to the buyer, emits ItemBougt event and update internal proceed record", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  nftmarketplace = NftMarketplace.connect(player)
                  nftmarketplacedep = NftMarketplace.connect(deployer)

                  await expect(
                      nftmarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  ).to.emit(NftMarketplace, "ItemBought")

                  //The ownerof function of ERC721 returns the address of the owner of the NFT with the tokenId given
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)
                  assert(newOwner.toString() == player.address)

                  //Updates the money that the seller (in this case the deployer) can withdraw

                  const deployerProceeds = await nftmarketplacedep.getProceeds(deployer)
                  assert(deployerProceeds.toString() == PRICE.toString())
              })
          })

          describe("cancelListing", function () {
              it("Cant cancel the NFT if its not listed", async function () {
                  await expect(
                      NftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  )
              })

              it("Only the Owner of the NFT can cancel it listing", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  nftmarketplace = await NftMarketplace.connect(player)
                  await basicNft.approve(player.address, TOKEN_ID)
                  await expect(
                      nftmarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`)
                  
              })
          })

          describe("updateListing", function () {
              it("Cant buy if the price is not met", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      NftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: ethers.utils.parseEther("0.01"),
                      })
                  ).to.be.revertedWith(
                      `NftMarketplace__PriceNotMet("${basicNft.address}", ${TOKEN_ID}, ${PRICE})`
                  )
              })
          })

          describe("withdrawPayment", function () {
              it("Cant buy if the price is not met", async function () {
                  await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      NftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: ethers.utils.parseEther("0.01"),
                      })
                  ).to.be.revertedWith(
                      `NftMarketplace__PriceNotMet("${basicNft.address}", ${TOKEN_ID}, ${PRICE})`
                  )
              })
          })
      })
