# sequPatternMining-SPADE.R
# source("sequPatternMining-SPADE.R")


library(Matrix)
library(arules)
library(arulesSequences)

x <- 0
con <- 0
x <- read_baskets(con = system.file("misc", "zaki.txt", package = "arulesSequences"), info = c("sequenceID","eventID","SIZE"))
# read_baskets(con, sep = "[ \t]+", info = NULL, iteminfo = NULL)14
#con an object of class connection or file name.
#sep a regular expression specifying how fields are separated in the data file.
#info a character vector specifying the header for columns with additional transaction information.
#iteminfo a data frame specifying (additional) item information.


# sequenceID = user ...


as(x, "data.frame")



s1 <- 0
s1 <- cspade(x, parameter = list(support = .3), control = list(verbose = FALSE))
print(s1)

print(summary(s1))
s <- as(s1, "data.frame")
print(sequenceInfo(s1))
#print(s)
