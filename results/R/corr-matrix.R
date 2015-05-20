# HowTo:
# 1. Open R in command line by opening the command line tool of your choice and typing: R
# 2. Open source this file: source("corr-matrix.R") 

library(lattice)

setwd("/home/abb/Documents/www2/vi-analytics/results/R/")
# participation,annotations,equal,role,foreignclicks,rhythm,foreigncontributions

# load data
d <- read.table("../data/corr-matrix-interactions.csv", sep=",", stringsAsFactors=FALSE, header=TRUE, fill=TRUE)



# prepare data
m <- cbind(d,d)
# ? pearson, spearman oder kendall? Man sollte die Methode wählen, die die niedrigsten Korrelationen ausgebibt
#COR <- cor(d, method="pearson", use="pairwise")
#COR <- cor(d, method="spearman", use="pairwise")
COR <- cor(d, method="kendall", use="pairwise")
print(COR)
x <- d
y <- d

# Kendalls tau ist hier nicht zulässig!! 
#https://de.wikipedia.org/wiki/Zusammenhangsma%C3%9F#F.C3.BCr_zwei_Variablen_unterschiedlichen_Skalenniveaus
#print("------------------xx")
#library(vcd)
#assocstats(d)
#print("------------------xxx")

# draw image
image(x=seq(dim(x)[2]), y=seq(dim(y)[2]), axes = FALSE, z=COR, xlab="", ylab="", col = colorRampPalette(c("white", "yellow", "red"))(10))

# column names for plotting // "Group\nSize",
colnames <- c("Video", "Video\nLanguage",  "Participation","Contribution","Equal\nParticipation","Roles","Reciprocal\nReception","Rhythm","Reciproval\nContributions")
# xaxis labels
text(seq(1, 9, by = 1)+.5, par("usr")[2] + 0.2, 
     labels = colnames, 
     srt = 0, pos = 2, cex = 0.7, xpd = TRUE, adj = c(0, 1)) 
     
# yaxis labels
text(par("usr")[3] - 0, seq(1, 9, by = 1), 
     labels = colnames, 
     srt = 0, pos = 2, cex = 0.7, xpd = TRUE, adj = c(0, 0))      
     
# beschriftung der matrixfelder
text(expand.grid(x=seq(dim(x)[2]), y=seq(dim(y)[2])), labels=round(c(COR),1))


print("-------------------------------------------")
## gesonderter Test, ob Nullhypothese für Videos gilt. Nullhypothese gilt, falls p < 0.05

# Alternativer test: http://www.r-tutor.com/gpu-computing/correlation/kendall-tau-b
#library(rpud)                     # load rpudplus 
#rpucor(m, method="kendall", use="pairwise")


out <- cor.test(d$video, d$language, method="kendall")
print(out)

out <- cor.test(d$video, d$participation, method="kendall")
print(out)

out <- cor.test(d$video, d$annotations, method="kendall")
print(out)

out <- cor.test(d$video, d$equal, method="kendall")
print(out)

out <- cor.test(d$video, d$role, method="kendall")
print(out)

out <- cor.test(d$video, d$foreignclicks, method="kendall")
print(out)

out <- cor.test(d$video, d$rhythm, method="kendall")
print(out)

out <- cor.test(d$video, d$foreigncontributions, method="kendall")
print(out)




     
     
