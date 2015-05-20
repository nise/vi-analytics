# HowTo:
# 1. Open R in command line by opening the command line tool of your choice and typing: R
# 2. Open source this file: source("eta.R") 

# install from source:
# install.packages('/home/abb/Downloads/sfsmisc_1.0-26.tar.gz', repos = NULL, type="source")


library(lattice)

setwd("/home/abb/Documents/www2/vi-analytics/results/R/")
# participation,annotations,equal,role,foreignclicks,rhythm,foreigncontributions


# workload histogram
# load data
table <- read.table("../data/scm-workload.csv", sep=",", stringsAsFactors=FALSE, header=TRUE, fill=TRUE)
d <- density(table$workload) # returns the density data
#plot(d) # plots the results
#hist(table$other, breaks=60, col="white") 
#hist(table$other, breaks=60, col="white") 


# compare two densities
#d1 <- density(table$german) # returns the density data
#d2 <- density(table$other) # returns the density data
#plot(range(d1$x, d2$x), range(d1$y, d2$y), type = "n", xlab = "x",
#ylab = "Density")
#lines(d1, col = "red")
#lines(d2, col = "blue")


# load data
d <- read.table("../data/r_user-activity-culture.csv", sep=",", stringsAsFactors=FALSE, header=TRUE, fill=TRUE)

#chisq.test(d$actions, d$culture)

# prepare data
#m <- cbind(d,d)
#y     <- c(d$actions)
#x     <- sort(d$culture)
#xy    <- data.frame(x,y)
#xyaov <- aov(y ~ x, xy)

library(heplots)
#etasq(xyaov)


# punkt-bisereale Korrelation
library(ltm)
# Actions:
# level = 1 :: deutsche ) - 0.07341322
# level = 2 :: others/ausländische studies = 0.07341322
# Contributions
# level = 1 :: deutsche ) -0.02688292
# level = 2 :: others/ausländische studies = 0.02688292
z<-biserial.cor(d$actions, d$country, use = c("all.obs", "complete.obs"), level = 2)
print(z)

y<-cor(d$actions, d$country)
print(y)

     
     
