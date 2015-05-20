# source("sequ.R")

library(TraMineR)

# split screen by 2x2
#par(mfrow=c(2,2))

#data(mvad)
#mvad <- system.file("misc", "iwrm-paths.tsv", ) #read.csv(file = "iwrm-paths.tsv", header = FALSE)


mvad <- read.csv(file = "iwrm-paths3.csv", header = FALSE)


mvad.labels <- c("borchardt2", "lennartz", "null")
mvad.scode <- c("borchardt2", "seidel1", "nu")
mvad.seq <- seqdef(mvad)#, states = mvad.scode, labels = mvad.labels)
mvad.seqe <- seqecreate(mvad.seq)
#fsubseq <- seqefsub(mvad.seqe, pMinSupport = 0.05)

#print(mvad)

#plot(mvad.seqe[1:15], col = "cyan")

fsubseq <- seqefsub(mvad.seqe, pMinSupport = 0.05)
plot(fsubseq[1:50], col = "cyan", cex = 0.4, cex.main=0.2)
text(fsubseq[1:50], 0, round(fsubseq[1:50], 1),cex=1,pos=3)

#seqdplot(mvad.seq, withlegend = F, border = NA, title = "State distribution plot")

#Turbulence <- seqST(mvad.seq)
#summary(Turbulence)
#hist(Turbulence, col = "cyan", main = "Sequence turbulence")

